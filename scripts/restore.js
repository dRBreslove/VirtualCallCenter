import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import { backupConfig } from '../src/config/backup.js';
import logger from '../src/utils/logger.js';
import emailService from '../src/services/emailService.js';
import s3Service from '../src/services/s3Service.js';
import verificationService from '../src/services/verificationService.js';

dotenv.config();

const execAsync = promisify(exec);

async function restoreBackup(backupPath) {
  const tempDir = path.join(path.dirname(backupPath), 'temp_restore');

  try {
    // Create temporary directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Verify backup before restoration
    const verificationResult = await verificationService.verifyBackup(backupPath);
    if (!verificationResult) {
      throw new Error('Backup verification failed');
    }

    // Extract backup
    logger.info('Extracting backup...');
    const zip = new AdmZip(backupPath);
    zip.extractAllTo(tempDir, true);
    logger.info('Backup extracted successfully');

    // Restore database
    logger.info('Starting database restoration...');
    await execAsync(`mongorestore --uri="${process.env.MONGODB_URI}" "${tempDir}"`);
    logger.info('Database restored successfully');

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Send success notification
    await emailService.sendBackupNotification('Restore Completed', {
      backupFile: backupPath,
      timestamp: new Date().toISOString()
    });

    logger.info('Restore process completed successfully');
  } catch (error) {
    logger.error('Restore process failed:', error);

    // Send failure notification
    await emailService.sendBackupNotification('Restore Failed', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // Clean up on failure
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    throw error;
  }
}

// Execute restore if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error('Please provide the path to the backup file');
    process.exit(1);
  }

  restoreBackup(backupPath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default restoreBackup; 