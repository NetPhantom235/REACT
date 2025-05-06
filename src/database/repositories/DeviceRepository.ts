import DatabaseService from '../DatabaseService';
import { Device, DeviceModel } from '../models/Device';

class DeviceRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Get all devices
   */
  async getAllDevices(): Promise<Device[]> {
    try {
      const results = await this.db.executeSql('SELECT * FROM maquinas');
      const devices: Device[] = [];
      
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        devices.push(DeviceModel.fromDatabase(row));
      }
      
      return devices;
    } catch (error) {
      console.error('Error getting devices:', error);
      throw error;
    }
  }

  /**
   * Get device by ID
   */
  async getDeviceById(id: number): Promise<Device | null> {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM maquinas WHERE id = ?',
        [id]
      );
      
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        return DeviceModel.fromDatabase(row);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting device with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get device by QR code
   */
  async getDeviceByQRCode(qrCode: string): Promise<Device | null> {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM maquinas WHERE codigo_qr = ?',
        [qrCode]
      );
      
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        return DeviceModel.fromDatabase(row);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting device with QR code ${qrCode}:`, error);
      throw error;
    }
  }

  /**
   * Create a new device
   */
  async createDevice(device: Device): Promise<number> {
    try {
      const dbDevice = DeviceModel.toDatabase(device);
      const fields = Object.keys(dbDevice).join(', ');
      const placeholders = Object.keys(dbDevice).map(() => '?').join(', ');
      const values = Object.values(dbDevice);
      
      const results = await this.db.executeSql(
        `INSERT INTO maquinas (${fields}) VALUES (${placeholders})`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'maquinas',
        'create',
        null, // userId would come from auth system
        null,
        dbDevice
      );
      
      return results.insertId;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  }

  /**
   * Update an existing device
   */
  async updateDevice(id: number, device: Device): Promise<boolean> {
    try {
      // Get the current device data for audit
      const currentDevice = await this.getDeviceById(id);
      if (!currentDevice) {
        return false;
      }
      
      const dbDevice = DeviceModel.toDatabase(device);
      const updates = Object.entries(dbDevice)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(dbDevice), id];
      
      const results = await this.db.executeSql(
        `UPDATE maquinas SET ${updates} WHERE id = ?`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'maquinas',
        'update',
        null, // userId would come from auth system
        currentDevice,
        dbDevice
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error updating device with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a device
   */
  async deleteDevice(id: number): Promise<boolean> {
    try {
      // Get the current device data for audit
      const currentDevice = await this.getDeviceById(id);
      if (!currentDevice) {
        return false;
      }
      
      const results = await this.db.executeSql(
        'DELETE FROM maquinas WHERE id = ?',
        [id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'maquinas',
        'delete',
        null, // userId would come from auth system
        currentDevice,
        null
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting device with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search devices by name or category
   */
  async searchDevices(query: string): Promise<Device[]> {
    try {
      const searchQuery = `%${query}%`;
      const results = await this.db.executeSql(
        'SELECT * FROM maquinas WHERE nombre LIKE ? OR categoria LIKE ? OR ubicacion LIKE ?',
        [searchQuery, searchQuery, searchQuery]
      );
      
      const devices: Device[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        devices.push(DeviceModel.fromDatabase(row));
      }
      
      return devices;
    } catch (error) {
      console.error('Error searching devices:', error);
      throw error;
    }
  }

  /**
   * Filter devices by status or category
   */
  async filterDevices(field: 'estado' | 'categoria', value: string): Promise<Device[]> {
    try {
      const results = await this.db.executeSql(
        `SELECT * FROM maquinas WHERE ${field} = ?`,
        [value]
      );
      
      const devices: Device[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        devices.push(DeviceModel.fromDatabase(row));
      }
      
      return devices;
    } catch (error) {
      console.error(`Error filtering devices by ${field}:`, error);
      throw error;
    }
  }

  /**
   * Get devices by supervisor ID
   */
  async getDevicesBySupervisor(supervisorId: number): Promise<Device[]> {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM maquinas WHERE supervisor_id = ?',
        [supervisorId]
      );
      
      const devices: Device[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        devices.push(DeviceModel.fromDatabase(row));
      }
      
      return devices;
    } catch (error) {
      console.error(`Error getting devices for supervisor ${supervisorId}:`, error);
      throw error;
    }
  }
}

export default DeviceRepository;