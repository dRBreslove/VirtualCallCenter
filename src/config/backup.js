import dotenv from 'dotenv';
dotenv.config();

export const backupConfig = {
  // Local backup settings
  local: {
    directory: 'backups',
    retentionDays: 7,
    compressionLevel: 9
  },

  // AWS S3 settings
  s3: {
    enabled: process.env.AWS_S3_ENABLED === 'true',
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    retentionDays: 30
  },

  // Email notification settings
  email: {
    enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    recipients: process.env.BACKUP_NOTIFICATION_EMAILS?.split(',') || []
  },

  // Backup verification settings
  verification: {
    enabled: true,
    checksum: true,
    dataIntegrity: true,
    maxVerificationTime: 300000 // 5 minutes in milliseconds
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: 'logs/backup.log',
    maxSize: '10m',
    maxFiles: '7d'
  }
}; 