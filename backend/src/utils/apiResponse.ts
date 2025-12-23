import { PaginationMetadata } from './pagination';

class ApiResponse<T> {
  public statusCode: number;
  public data: T;
  public message: string;
  public pagination?: PaginationMetadata;
  public success: boolean;

  constructor(
    statusCode: number,
    data: T,
    message: string = 'Success',
    pagination?: PaginationMetadata
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    if (pagination) {
      this.pagination = pagination;
    }
    this.success = statusCode >= 200 && statusCode < 300;
  }
}

export default ApiResponse;
