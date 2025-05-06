import DatabaseService from '../DatabaseService';
import { Supervisor, SupervisorModel } from '../models/Supervisor';

class SupervisorRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Get all supervisors
   */
  async getAllSupervisors(): Promise<Supervisor[]> {
    try {
      const results = await this.db.executeSql('SELECT * FROM supervisores');
      const supervisors: Supervisor[] = [];
      
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        supervisors.push(SupervisorModel.fromDatabase(row));
      }
      
      return supervisors;
    } catch (error) {
      console.error('Error getting supervisors:', error);
      throw error;
    }
  }

  /**
   * Get supervisor by ID
   */
  async getSupervisorById(id: number): Promise<Supervisor | null> {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM supervisores WHERE id = ?',
        [id]
      );
      
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        return SupervisorModel.fromDatabase(row);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting supervisor with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new supervisor
   */
  async createSupervisor(supervisor: Supervisor): Promise<number> {
    try {
      const dbSupervisor = SupervisorModel.toDatabase(supervisor);
      const fields = Object.keys(dbSupervisor).join(', ');
      const placeholders = Object.keys(dbSupervisor).map(() => '?').join(', ');
      const values = Object.values(dbSupervisor);
      
      const results = await this.db.executeSql(
        `INSERT INTO supervisores (${fields}) VALUES (${placeholders})`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'supervisores',
        'create',
        null, // userId would come from auth system
        null,
        dbSupervisor
      );
      
      return results.insertId;
    } catch (error) {
      console.error('Error creating supervisor:', error);
      throw error;
    }
  }

  /**
   * Update an existing supervisor
   */
  async updateSupervisor(id: number, supervisor: Supervisor): Promise<boolean> {
    try {
      // Get the current supervisor data for audit
      const currentSupervisor = await this.getSupervisorById(id);
      if (!currentSupervisor) {
        return false;
      }
      
      const dbSupervisor = SupervisorModel.toDatabase(supervisor);
      const updates = Object.entries(dbSupervisor)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(dbSupervisor), id];
      
      const results = await this.db.executeSql(
        `UPDATE supervisores SET ${updates} WHERE id = ?`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'supervisores',
        'update',
        null, // userId would come from auth system
        currentSupervisor,
        dbSupervisor
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error updating supervisor with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a supervisor
   */
  async deleteSupervisor(id: number): Promise<boolean> {
    try {
      // Get the current supervisor data for audit
      const currentSupervisor = await this.getSupervisorById(id);
      if (!currentSupervisor) {
        return false;
      }
      
      const results = await this.db.executeSql(
        'DELETE FROM supervisores WHERE id = ?',
        [id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'supervisores',
        'delete',
        null, // userId would come from auth system
        currentSupervisor,
        null
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting supervisor with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search supervisors by name or email
   */
  async searchSupervisors(query: string): Promise<Supervisor[]> {
    try {
      const searchQuery = `%${query}%`;
      const results = await this.db.executeSql(
        'SELECT * FROM supervisores WHERE nombre LIKE ? OR email LIKE ?',
        [searchQuery, searchQuery]
      );
      
      const supervisors: Supervisor[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        supervisors.push(SupervisorModel.fromDatabase(row));
      }
      
      return supervisors;
    } catch (error) {
      console.error('Error searching supervisors:', error);
      throw error;
    }
  }

  /**
   * Filter supervisors by permission or status
   */
  async filterSupervisors(field: 'permiso' | 'estado', value: string): Promise<Supervisor[]> {
    try {
      const results = await this.db.executeSql(
        `SELECT * FROM supervisores WHERE ${field} = ?`,
        [value]
      );
      
      const supervisors: Supervisor[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        supervisors.push(SupervisorModel.fromDatabase(row));
      }
      
      return supervisors;
    } catch (error) {
      console.error(`Error filtering supervisors by ${field}:`, error);
      throw error;
    }
  }
}

export default SupervisorRepository;