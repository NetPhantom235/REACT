/**
 * Loan model representing the 'prestamos' table in the database
 */
export interface Loan {
  id?: number;
  maquina_id: number;
  supervisor_id: number;
  fecha_prestamo: string;
  fecha_devolucion?: string;
  observaciones?: string;
  estado: 'Active' | 'Returned';
  
  // Additional fields for UI display (not stored in database)
  deviceName?: string;
  supervisorName?: string;
}

export class LoanModel {
  /**
   * Convert database row to Loan object
   */
  static fromDatabase(row: any): Loan {
    return {
      id: row.id,
      maquina_id: row.maquina_id,
      supervisor_id: row.supervisor_id,
      fecha_prestamo: row.fecha_prestamo,
      fecha_devolucion: row.fecha_devolucion,
      observaciones: row.observaciones,
      estado: row.estado
    };
  }

  /**
   * Convert Loan object to database format
   */
  static toDatabase(loan: Loan): any {
    return {
      maquina_id: loan.maquina_id,
      supervisor_id: loan.supervisor_id,
      fecha_prestamo: loan.fecha_prestamo,
      fecha_devolucion: loan.fecha_devolucion,
      observaciones: loan.observaciones,
      estado: loan.estado
    };
  }
}