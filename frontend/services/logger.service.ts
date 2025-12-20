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

  private async sendToBackend(logData: LogData): Promise<void> {
    try {
      // Don't await - fire and forget to not block execution
      fetch("/api/logger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...logData,
          timestamp: new Date().toISOString(),
          userAgent:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : "server",
          url: typeof window !== "undefined" ? window.location.href : "server",
        }),
        // Don't wait for response
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't want logging errors to break the app
      });
    } catch {
      // Silently fail
    }
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
