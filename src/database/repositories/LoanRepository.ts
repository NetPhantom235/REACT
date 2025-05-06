import DatabaseService from '../DatabaseService';
import { Loan, LoanModel } from '../models/Loan';

class LoanRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Get all loans
   */
  async getAllLoans(): Promise<Loan[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
      `);
      
      const loans: Loan[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error('Error getting loans:', error);
      throw error;
    }
  }

  /**
   * Get loan by ID
   */
  async getLoanById(id: number): Promise<Loan | null> {
    try {
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
        WHERE p.id = ?
      `, [id]);
      
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        return loan;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting loan with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get active loans for a device
   */
  async getActiveLoansForDevice(deviceId: number): Promise<Loan[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
        WHERE p.maquina_id = ? AND p.estado = 'Active'
      `, [deviceId]);
      
      const loans: Loan[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error(`Error getting active loans for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get loans by supervisor ID
   */
  async getLoansBySupervisor(supervisorId: number): Promise<Loan[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
        WHERE p.supervisor_id = ?
      `, [supervisorId]);
      
      const loans: Loan[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error(`Error getting loans for supervisor ${supervisorId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new loan
   */
  async createLoan(loan: Loan): Promise<number> {
    try {
      const dbLoan = LoanModel.toDatabase(loan);
      const fields = Object.keys(dbLoan).join(', ');
      const placeholders = Object.keys(dbLoan).map(() => '?').join(', ');
      const values = Object.values(dbLoan);
      
      const results = await this.db.executeSql(
        `INSERT INTO prestamos (${fields}) VALUES (${placeholders})`,
        values
      );
      
      // Update device status to 'In Use'
      await this.db.executeSql(
        'UPDATE maquinas SET estado = ? WHERE id = ?',
        ['In Use', loan.maquina_id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'prestamos',
        'create',
        null, // userId would come from auth system
        null,
        dbLoan
      );
      
      return results.insertId;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  /**
   * Update an existing loan
   */
  async updateLoan(id: number, loan: Loan): Promise<boolean> {
    try {
      // Get the current loan data for audit
      const currentLoan = await this.getLoanById(id);
      if (!currentLoan) {
        return false;
      }
      
      const dbLoan = LoanModel.toDatabase(loan);
      const updates = Object.entries(dbLoan)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(dbLoan), id];
      
      const results = await this.db.executeSql(
        `UPDATE prestamos SET ${updates} WHERE id = ?`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'prestamos',
        'update',
        null, // userId would come from auth system
        currentLoan,
        dbLoan
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error updating loan with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Return a device (complete a loan)
   */
  async returnDevice(id: number): Promise<boolean> {
    try {
      // Get the current loan data for audit
      const currentLoan = await this.getLoanById(id);
      if (!currentLoan || currentLoan.estado !== 'Active') {
        return false;
      }
      
      const returnDate = new Date().toISOString().split('T')[0];
      
      const results = await this.db.executeSql(
        'UPDATE prestamos SET estado = ?, fecha_devolucion = ? WHERE id = ?',
        ['Returned', returnDate, id]
      );
      
      // Update device status to 'Available'
      await this.db.executeSql(
        'UPDATE maquinas SET estado = ? WHERE id = ?',
        ['Available', currentLoan.maquina_id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'prestamos',
        'return',
        null, // userId would come from auth system
        currentLoan,
        { ...currentLoan, estado: 'Returned', fecha_devolucion: returnDate }
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error returning device for loan with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a loan
   */
  async deleteLoan(id: number): Promise<boolean> {
    try {
      // Get the current loan data for audit
      const currentLoan = await this.getLoanById(id);
      if (!currentLoan) {
        return false;
      }
      
      const results = await this.db.executeSql(
        'DELETE FROM prestamos WHERE id = ?',
        [id]
      );
      
      // If it was an active loan, update device status to 'Available'
      if (currentLoan.estado === 'Active') {
        await this.db.executeSql(
          'UPDATE maquinas SET estado = ? WHERE id = ?',
          ['Available', currentLoan.maquina_id]
        );
      }
      
      // Log the action in the audit table
      await this.db.logAudit(
        'prestamos',
        'delete',
        null, // userId would come from auth system
        currentLoan,
        null
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting loan with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search loans by device name or supervisor name
   */
  async searchLoans(query: string): Promise<Loan[]> {
    try {
      const searchQuery = `%${query}%`;
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
        WHERE m.nombre LIKE ? OR s.nombre LIKE ?
      `, [searchQuery, searchQuery]);
      
      const loans: Loan[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error('Error searching loans:', error);
      throw error;
    }
  }

  /**
   * Filter loans by status
   */
  async filterLoansByStatus(status: 'Active' | 'Returned'): Promise<Loan[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT p.*, m.nombre as deviceName, s.nombre as supervisorName 
        FROM prestamos p
        LEFT JOIN maquinas m ON p.maquina_id = m.id
        LEFT JOIN supervisores s ON p.supervisor_id = s.id
        WHERE p.estado = ?
      `, [status]);
      
      const loans: Loan[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const loan = LoanModel.fromDatabase(row);
        loan.deviceName = row.deviceName;
        loan.supervisorName = row.supervisorName;
        loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error(`Error filtering loans by status ${status}:`, error);
      throw error;
    }
  }
}

export default LoanRepository;