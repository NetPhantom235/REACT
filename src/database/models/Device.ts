/**
 * Device model representing the 'maquinas' table in the database
 */
export interface Device {
  id?: number;
  nombre: string;
  categoria: string;
  estado: string;
  ubicacion?: string;
  ultimo_mantenimiento?: string;
  codigo_qr?: string;
  supervisor_id?: number;
}

export class DeviceModel {
  /**
   * Convert database row to Device object
   */
  static fromDatabase(row: any): Device {
    return {
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      estado: row.estado,
      ubicacion: row.ubicacion,
      ultimo_mantenimiento: row.ultimo_mantenimiento,
      codigo_qr: row.codigo_qr,
      supervisor_id: row.supervisor_id
    };
  }

  /**
   * Convert Device object to database format
   */
  static toDatabase(device: Device): any {
    return {
      nombre: device.nombre,
      categoria: device.categoria,
      estado: device.estado,
      ubicacion: device.ubicacion,
      ultimo_mantenimiento: device.ultimo_mantenimiento,
      codigo_qr: device.codigo_qr,
      supervisor_id: device.supervisor_id
    };
  }
}