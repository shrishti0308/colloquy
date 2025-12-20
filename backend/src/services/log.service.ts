import fs from 'fs/promises';
import path from 'path';
import { FrontendLogData } from '../types/log.types';
import logger from '../utils/logger';

class LogService {
  private logsDir: string;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.initializeLogsDirectory();
  }

  private async initializeLogsDirectory(): Promise<void> {
    try {
      await fs.access(this.logsDir);
    } catch {
      await fs.mkdir(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `frontend-${level}-${date}.log`;
  }

  private formatLogEntry(logData: FrontendLogData): string {
    const logEntry = {
      timestamp: logData.timestamp,
      level: logData.level.toUpperCase(),
      context: logData.context || 'UNKNOWN',
      message: logData.message,
      url: logData.url,
      userAgent: logData.userAgent,
      details: logData.details,
      stack: logData.stack,
    };

    return JSON.stringify(logEntry) + '\n';
  }

  async logFrontendError(logData: FrontendLogData): Promise<void> {
    try {
      const fileName = this.getLogFileName(logData.level);
      const filePath = path.join(this.logsDir, fileName);
      const logEntry = this.formatLogEntry(logData);

      // Append to file (create if doesn't exist)
      await fs.appendFile(filePath, logEntry, 'utf-8');
    } catch (error) {
      logger.error('Failed to write frontend log:', { error });
    }
  }

  async getRecentLogs(
    level?: string,
    limit: number = 100
  ): Promise<FrontendLogData[]> {
    try {
      const files = await fs.readdir(this.logsDir);
      const logFiles = files.filter((file) => {
        if (level) {
          return file.startsWith(`frontend-${level}-`) && file.endsWith('.log');
        }
        return file.startsWith('frontend-') && file.endsWith('.log');
      });

      // Sort by date (newest first)
      logFiles.sort().reverse();

      const logs: FrontendLogData[] = [];

      // Read the most recent file(s)
      for (const file of logFiles.slice(0, 3)) {
        // Read last 3 days
        const filePath = path.join(this.logsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n');

        for (const line of lines.slice(-limit)) {
          // Get last N lines
          try {
            logs.push(JSON.parse(line));
          } catch {
            // Skip invalid JSON lines
          }
        }

        if (logs.length >= limit) break;
      }

      return logs.slice(-limit);
    } catch (error) {
      logger.error('Failed to retrieve recent logs:', { error });
      return [];
    }
  }

  async clearOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.logsDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.startsWith('frontend-') || !file.endsWith('.log')) continue;

        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          logger.info(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Failed to clear old logs:', { error });
    }
  }
}

export const logService = new LogService();
