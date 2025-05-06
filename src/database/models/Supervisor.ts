/**
 * Supervisor model representing the 'supervisores' table in the database
 */
export interface Supervisor {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  permiso: 'Admin' | 'Basic' | 'Auditor';
  estado: 'Active' | 'Inactive';
  fecha_registro: string;
}

export class SupervisorModel {
  /**
   * Convert database row to Supervisor object
   */
  static fromDatabase(row: any): Supervisor {
    return {
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      permiso: row.permiso,
      estado: row.estado,
      fecha_registro: row.fecha_registro
    };
  }

  /**
   * Convert Supervisor object to database format
   */
  static toDatabase(supervisor: Supervisor): any {
    return {
      nombre: supervisor.nombre,
      email: supervisor.email,
      telefono: supervisor.telefono,
      permiso: supervisor.permiso,
      estado: supervisor.estado,
      fecha_registro: supervisor.fecha_registro
    };
  }
}