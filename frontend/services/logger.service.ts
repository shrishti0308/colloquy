interface LogData {
  level: "error" | "warn" | "info";
  message: string;
  context?: string;
  details?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === "development";
  private logQueue: LogData[] = [];
  private lastFlush = Date.now();
  private readonly FLUSH_INTERVAL_MS = 1000; // 1 second
  private readonly MAX_LOGS_PER_INTERVAL = 10;

  private async sendToBackend(logData: LogData): Promise<void> {
    this.logQueue.push(logData);

    const now = Date.now();
    if (now - this.lastFlush >= this.FLUSH_INTERVAL_MS) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToSend = this.logQueue.splice(0, this.MAX_LOGS_PER_INTERVAL);
    this.lastFlush = Date.now();

    try {
      fetch("/api/logger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: logsToSend.map((log) => ({
            ...log,
            timestamp: new Date().toISOString(),
            userAgent:
              typeof window !== "undefined"
                ? window.navigator.userAgent
                : "server",
            url:
              typeof window !== "undefined" ? window.location.href : "server",
          })),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  error(message: string, context?: string, details?: any): void {
    // Always log to console in development
    if (this.isDevelopment) {
      console.error(`[${context || "Error"}]`, message, details);
    }

    // Send to backend in all environments
    this.sendToBackend({
      level: "error",
      message,
      context,
      details,
      stack: details instanceof Error ? details.stack : undefined,
    });
  }

  warn(message: string, context?: string, details?: any): void {
    if (this.isDevelopment) {
      console.warn(`[${context || "Warning"}]`, message, details);
    }

    this.sendToBackend({
      level: "warn",
      message,
      context,
      details,
    });
  }

  info(message: string, context?: string, details?: any): void {
    if (this.isDevelopment) {
      console.info(`[${context || "Info"}]`, message, details);
    }

    this.sendToBackend({
      level: "info",
      message,
      context,
      details,
    });
  }
}

export const logger = new LoggerService();
