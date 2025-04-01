import winston from 'winston';
import path from 'path';
import { backupConfig } from '../config/backup.js';

const { format, transports } = winston;

const logFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = winston.createLogger({
  level: backupConfig.logging.level,
  format: logFormat,
  transports: [
    new transports.File({
      filename: backupConfig.logging.file,
      maxsize: backupConfig.logging.maxSize,
      maxFiles: backupConfig.logging.maxFiles
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

export default logger; 