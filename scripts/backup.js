import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import moment from 'moment';
import dotenv from 'dotenv';
import { backupConfig } from '../src/config/backup.js';
import logger from '../src/utils/logger.js';
import emailService from '../src/services/emailService.js';
import s3Service from '../src/services/s3Service.js';
import verificationService from '../src/services/verificationService.js';

dotenv.config();

const execAsync = promisify(exec);

async function createBackup() {
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  const backupDir = path.join(process.cwd(), backupConfig.local.backupDir);
  const backupFile = path.join(backupDir, `backup_${timestamp}.zip`);
  const dumpDir = path.join(backupDir, 'temp_dump');

  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create temporary dump directory
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }

    // Execute mongodump
    logger.info('Starting MongoDB backup...');
    await execAsync(`mongodump --uri="${process.env.MONGODB_URI}" --out="${dumpDir}"`);
    logger.info('MongoDB dump completed successfully');

    // Create zip archive
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', {
      zlib: { level: backupConfig.local.compressionLevel }
    });

    archive.pipe(output);
    archive.directory(dumpDir, false);
    await archive.finalize();
    logger.info(`Backup compressed to: ${backupFile}`);

    // Verify backup
    const verificationResult = await verificationService.verifyBackup(backupFile);
    if (!verificationResult) {
      throw new Error('Backup verification failed');
    }

    // Upload to S3 if enabled
    let s3Key = null;
    if (backupConfig.s3.enabled) {
      s3Key = await s3Service.uploadBackup(backupFile);
    }

    // Clean up dump directory
    fs.rmSync(dumpDir, { recursive: true, force: true });

    // Clean up old backups
    await cleanupOldBackups(backupDir);

    // Send email notification
    const details = {
      backupFile,
      size: fs.statSync(backupFile).size,
      s3Key,
      verification: verificationResult
    };
    await emailService.sendBackupNotification('Completed', details);

    logger.info('Backup process completed successfully');
    return backupFile;
  } catch (error) {
    logger.error('Backup process failed:', error);
    
    // Send failure notification
    await emailService.sendBackupNotification('Failed', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // Clean up on failure
    if (fs.existsSync(dumpDir)) {
      fs.rmSync(dumpDir, { recursive: true, force: true });
    }

    throw error;
  }
}

async function cleanupOldBackups(backupDir) {
  const files = fs.readdirSync(backupDir);
  const now = moment();

  for (const file of files) {
    if (!file.endsWith('.zip')) continue;

    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = moment(stats.mtime);

    if (now.diff(fileAge, 'days') > backupConfig.local.retentionDays) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old backup: ${file}`);
    }
  }
}

// Execute backup if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default createBackup; 