import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { backupConfig } from '../config/backup.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

class S3Service {
  constructor() {
    if (!backupConfig.s3.enabled) {
      logger.info('S3 backup is disabled');
      return;
    }

    this.client = new S3Client({
      region: backupConfig.s3.region,
      credentials: {
        accessKeyId: backupConfig.s3.accessKeyId,
        secretAccessKey: backupConfig.s3.secretAccessKey
      }
    });

    this.bucket = backupConfig.s3.bucket;
  }

  async uploadBackup(filePath) {
    if (!backupConfig.s3.enabled) {
      logger.info('S3 backup is disabled');
      return;
    }

    const fileName = path.basename(filePath);
    const key = `backups/${fileName}`;

    try {
      const fileStream = fs.createReadStream(filePath);
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileStream
      }));
      logger.info(`Backup uploaded to S3: ${key}`);
      return key;
    } catch (error) {
      logger.error('Failed to upload backup to S3:', error);
      throw error;
    }
  }

  async downloadBackup(key, destinationPath) {
    if (!backupConfig.s3.enabled) {
      logger.info('S3 backup is disabled');
      return;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      
      // Download using the signed URL
      const response = await fetch(signedUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(destinationPath, Buffer.from(buffer));
      
      logger.info(`Backup downloaded from S3: ${key}`);
      return destinationPath;
    } catch (error) {
      logger.error('Failed to download backup from S3:', error);
      throw error;
    }
  }

  async cleanupOldBackups() {
    if (!backupConfig.s3.enabled) {
      logger.info('S3 backup is disabled');
      return;
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'backups/'
      });

      const response = await this.client.send(command);
      const now = new Date();
      const retentionPeriod = backupConfig.s3.retentionDays * 24 * 60 * 60 * 1000;

      for (const object of response.Contents) {
        const lastModified = object.LastModified;
        const age = now - lastModified;

        if (age > retentionPeriod) {
          await this.client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: object.Key
          }));
          logger.info(`Deleted old backup from S3: ${object.Key}`);
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups from S3:', error);
      throw error;
    }
  }
}

export default new S3Service(); 