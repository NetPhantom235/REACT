/**
 * Alert model representing the 'alertas' table in the database
 */
export interface Alert {
  id?: number;
  maquina_id?: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  resuelta: boolean;
  
  // Additional fields for UI display (not stored in database)
  deviceName?: string;
}

export class AlertModel {
  /**
   * Convert database row to Alert object
   */
  static fromDatabase(row: any): Alert {
    return {
      id: row.id,
      maquina_id: row.maquina_id,
      tipo: row.tipo,
      descripcion: row.descripcion,
      fecha: row.fecha,
      resuelta: row.resuelta === 1
    };
  }

  /**
   * Convert Alert object to database format
   */
  static toDatabase(alert: Alert): any {
    return {
      maquina_id: alert.maquina_id,
      tipo: alert.tipo,
      descripcion: alert.descripcion,
      fecha: alert.fecha,
      resuelta: alert.resuelta ? 1 : 0
    };
  }
}