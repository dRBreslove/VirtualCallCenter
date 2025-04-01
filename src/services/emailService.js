import nodemailer from 'nodemailer';
import { backupConfig } from '../config/backup.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: backupConfig.email.smtp.host,
      port: backupConfig.email.smtp.port,
      secure: backupConfig.email.smtp.secure,
      auth: {
        user: backupConfig.email.smtp.auth.user,
        pass: backupConfig.email.smtp.auth.pass
      }
    });
  }

  async sendBackupNotification(status, details) {
    if (!backupConfig.email.enabled) {
      logger.info('Email notifications are disabled');
      return;
    }

    const subject = `Database Backup ${status}`;
    const html = this.generateEmailContent(status, details);

    try {
      await this.transporter.sendMail({
        from: backupConfig.email.smtp.auth.user,
        to: backupConfig.email.recipients.join(','),
        subject,
        html
      });
      logger.info('Backup notification email sent successfully');
    } catch (error) {
      logger.error('Failed to send backup notification email:', error);
      throw error;
    }
  }

  generateEmailContent(status, details) {
    const timestamp = new Date().toISOString();
    return `
      <h2>Database Backup ${status}</h2>
      <p>Time: ${timestamp}</p>
      <h3>Details:</h3>
      <pre>${JSON.stringify(details, null, 2)}</pre>
    `;
  }
}

export default new EmailService(); 