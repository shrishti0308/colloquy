export interface FrontendLogData {
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: string;
  details?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
}
