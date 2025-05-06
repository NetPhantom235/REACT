// @ts-ignore
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable SQLite Promises
SQLite.enablePromise(true);

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;
  private initialized: boolean = false;

  // Singleton instance
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection
   */
  public async initDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      // Open the database
      this.database = await SQLite.openDatabase({
        name: 'devicemanager.db',
        location: 'default',
      });

      console.log('Database initialized successfully');

      // Create tables if they don't exist
      await this.createTables();
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create all required tables if they don't exist
   */
  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    // Create supervisores table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS supervisores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE,
        telefono TEXT,
        permiso TEXT NOT NULL,
        estado TEXT NOT NULL,
        fecha_registro TEXT NOT NULL
      );
    `);

    // Create maquinas table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS maquinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        estado TEXT NOT NULL,
        ubicacion TEXT,
        ultimo_mantenimiento TEXT,
        codigo_qr TEXT UNIQUE,
        supervisor_id INTEGER,
        FOREIGN KEY (supervisor_id) REFERENCES supervisores (id)
      );
    `);

    // Create prestamos table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS prestamos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maquina_id INTEGER NOT NULL,
        supervisor_id INTEGER NOT NULL,
        fecha_prestamo TEXT NOT NULL,
        fecha_devolucion TEXT,
        observaciones TEXT,
        estado TEXT NOT NULL,
        FOREIGN KEY (maquina_id) REFERENCES maquinas (id),
        FOREIGN KEY (supervisor_id) REFERENCES supervisores (id)
      );
    `);

    // Create alertas table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS alertas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maquina_id INTEGER,
        tipo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        fecha TEXT NOT NULL,
        resuelta INTEGER DEFAULT 0,
        FOREIGN KEY (maquina_id) REFERENCES maquinas (id)
      );
    `);

    // Create auditoria table for tracking changes
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tabla_afectada TEXT NOT NULL,
        accion TEXT NOT NULL,
        usuario_id INTEGER,
        fecha TEXT NOT NULL,
        datos_anteriores TEXT,
        datos_nuevos TEXT
      );
    `);

    console.log('All tables created successfully');
  }

  /**
   * Execute a SQL query with parameters
   */
  public async executeSql(sql: string, params: any[] = []): Promise<any> {
    if (!this.database) {
      await this.initDatabase();
    }

    try {
      const [results] = await this.database!.executeSql(sql, params);
      return results;
    } catch (error) {
      console.error('Error executing SQL:', sql, error);
      throw error;
    }
  }

  /**
   * Insert a record into the audit table
   */
  public async logAudit(
    table: string,
    action: string,
    userId: number | null,
    oldData: any = null,
    newData: any = null
  ): Promise<void> {
    const date = new Date().toISOString();
    const oldDataStr = oldData ? JSON.stringify(oldData) : null;
    const newDataStr = newData ? JSON.stringify(newData) : null;

    await this.executeSql(
      `INSERT INTO auditoria (tabla_afectada, accion, usuario_id, fecha, datos_anteriores, datos_nuevos) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [table, action, userId, date, oldDataStr, newDataStr]
    );
  }

  /**
   * Close the database connection
   */
  public async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
      this.initialized = false;
      console.log('Database closed');
    }
  }

  /**
   * Check if the database has been initialized with sample data
   */
  public async isDataInitialized(): Promise<boolean> {
    try {
      const initialized = await AsyncStorage.getItem('DB_INITIALIZED');
      return initialized === 'true';
    } catch (error) {
      console.error('Error checking if data is initialized:', error);
      return false;
    }
  }

  /**
   * Mark the database as initialized with sample data
   */
  public async markDataAsInitialized(): Promise<void> {
    try {
      await AsyncStorage.setItem('DB_INITIALIZED', 'true');
    } catch (error) {
      console.error('Error marking data as initialized:', error);
    }
  }
}

export default DatabaseService;