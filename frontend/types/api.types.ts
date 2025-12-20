export interface ApiSuccessResponse<T = any> {
  success: true;
  statusCode: number;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  stack?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
