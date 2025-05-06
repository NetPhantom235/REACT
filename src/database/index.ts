// Export database service
import DatabaseService from './DatabaseService';

// Export models
import { Device, DeviceModel } from './models/Device';
import { Supervisor, SupervisorModel } from './models/Supervisor';
import { Loan, LoanModel } from './models/Loan';
import { Alert, AlertModel } from './models/Alert';

// Export repositories
import DeviceRepository from './repositories/DeviceRepository';
import SupervisorRepository from './repositories/SupervisorRepository';
import LoanRepository from './repositories/LoanRepository';
import AlertRepository from './repositories/AlertRepository';

// Initialize database
const initDatabase = async () => {
  const db = DatabaseService.getInstance();
  await db.initDatabase();
  return db;
};

export {
  // Service
  DatabaseService,
  initDatabase,
  
  // Models
  Device,
  DeviceModel,
  Supervisor,
  SupervisorModel,
  Loan,
  LoanModel,
  Alert,
  AlertModel,
  
  // Repositories
  DeviceRepository,
  SupervisorRepository,
  LoanRepository,
  AlertRepository
};