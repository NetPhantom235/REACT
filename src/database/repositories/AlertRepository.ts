import DatabaseService from '../DatabaseService';
import { Alert, AlertModel } from '../models/Alert';

class AlertRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Get all alerts
   */
  async getAllAlerts(): Promise<Alert[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT a.*, m.nombre as deviceName
        FROM alertas a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
      `);
      
      const alerts: Alert[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const alert = AlertModel.fromDatabase(row);
        alert.deviceName = row.deviceName;
        alerts.push(alert);
      }
      
      return alerts;
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: number): Promise<Alert | null> {
    try {
      const results = await this.db.executeSql(`
        SELECT a.*, m.nombre as deviceName
        FROM alertas a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
        WHERE a.id = ?
      `, [id]);
      
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        const alert = AlertModel.fromDatabase(row);
        alert.deviceName = row.deviceName;
        return alert;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting alert with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get alerts for a device
   */
  async getAlertsForDevice(deviceId: number): Promise<Alert[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT a.*, m.nombre as deviceName
        FROM alertas a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
        WHERE a.maquina_id = ?
      `, [deviceId]);
      
      const alerts: Alert[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const alert = AlertModel.fromDatabase(row);
        alert.deviceName = row.deviceName;
        alerts.push(alert);
      }
      
      return alerts;
    } catch (error) {
      console.error(`Error getting alerts for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get unresolved alerts
   */
  async getUnresolvedAlerts(): Promise<Alert[]> {
    try {
      const results = await this.db.executeSql(`
        SELECT a.*, m.nombre as deviceName
        FROM alertas a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
        WHERE a.resuelta = 0
      `);
      
      const alerts: Alert[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const alert = AlertModel.fromDatabase(row);
        alert.deviceName = row.deviceName;
        alerts.push(alert);
      }
      
      return alerts;
    } catch (error) {
      console.error('Error getting unresolved alerts:', error);
      throw error;
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(alert: Alert): Promise<number> {
    try {
      const dbAlert = AlertModel.toDatabase(alert);
      const fields = Object.keys(dbAlert).join(', ');
      const placeholders = Object.keys(dbAlert).map(() => '?').join(', ');
      const values = Object.values(dbAlert);
      
      const results = await this.db.executeSql(
        `INSERT INTO alertas (${fields}) VALUES (${placeholders})`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'alertas',
        'create',
        null, // userId would come from auth system
        null,
        dbAlert
      );
      
      return results.insertId;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Update an existing alert
   */
  async updateAlert(id: number, alert: Alert): Promise<boolean> {
    try {
      // Get the current alert data for audit
      const currentAlert = await this.getAlertById(id);
      if (!currentAlert) {
        return false;
      }
      
      const dbAlert = AlertModel.toDatabase(alert);
      const updates = Object.entries(dbAlert)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(dbAlert), id];
      
      const results = await this.db.executeSql(
        `UPDATE alertas SET ${updates} WHERE id = ?`,
        values
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'alertas',
        'update',
        null, // userId would come from auth system
        currentAlert,
        dbAlert
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error updating alert with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark an alert as resolved
   */
  async resolveAlert(id: number): Promise<boolean> {
    try {
      // Get the current alert data for audit
      const currentAlert = await this.getAlertById(id);
      if (!currentAlert) {
        return false;
      }
      
      const results = await this.db.executeSql(
        'UPDATE alertas SET resuelta = 1 WHERE id = ?',
        [id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'alertas',
        'resolve',
        null, // userId would come from auth system
        currentAlert,
        { ...currentAlert, resuelta: true }
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error resolving alert with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(id: number): Promise<boolean> {
    try {
      // Get the current alert data for audit
      const currentAlert = await this.getAlertById(id);
      if (!currentAlert) {
        return false;
      }
      
      const results = await this.db.executeSql(
        'DELETE FROM alertas WHERE id = ?',
        [id]
      );
      
      // Log the action in the audit table
      await this.db.logAudit(
        'alertas',
        'delete',
        null, // userId would come from auth system
        currentAlert,
        null
      );
      
      return results.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting alert with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search alerts by description or type
   */
  async searchAlerts(query: string): Promise<Alert[]> {
    try {
      const searchQuery = `%${query}%`;
      const results = await this.db.executeSql(`
        SELECT a.*, m.nombre as deviceName
        FROM alertas a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
        WHERE a.descripcion LIKE ? OR a.tipo LIKE ?
      `, [searchQuery, searchQuery]);
      
      const alerts: Alert[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const alert = AlertModel.fromDatabase(row);
        alert.deviceName = row.deviceName;
        alerts.push(alert);
      }
      
      return alerts;
    } catch (error) {
      console.error('Error searching alerts:', error);
      throw error;
    }
  }
}

export default AlertRepository;