import { API_CONFIG } from "@/config/constants";
import { tokenStorage } from "@/lib/token-storage";
import { logger } from "@/services/logger.service";
import { ApiErrorResponse, RateLimitInfo } from "@/types/api.types";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for refresh token cookie
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Extract rate limit info from headers
        this.extractRateLimitInfo(response.headers);
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Extract rate limit info even from error responses
        if (error.response) {
          this.extractRateLimitInfo(error.response.headers);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const resetTime =
            this.rateLimitInfo?.reset || Date.now() + 15 * 60 * 1000;

          return Promise.reject({
            ...error,
            isRateLimited: true,
            retryAfter: retryAfter ? parseInt(retryAfter) : null,
            resetTime,
            message:
              error.response.data?.message ||
              "Too many requests. Please try again later.",
          });
        }

        // Skip token refresh for auth endpoints
        const isAuthEndpoint =
          originalRequest?.url?.includes("/auth/login") ||
          originalRequest?.url?.includes("/auth/register") ||
          originalRequest?.url?.includes("/auth/forgot-password") ||
          originalRequest?.url?.includes("/auth/reset-password");

        // Handle token refresh
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Call refresh endpoint
            const response = await axios.post(
              `/api/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken } = response.data.data;
            tokenStorage.setAccessToken(accessToken);

            // Retry all queued requests
            this.processQueue(null);

            // Retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.processQueue(refreshError);
            tokenStorage.clearAll();

            // Redirect to login page
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform error to a consistent format
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  private extractRateLimitInfo(headers: any): void {
    const limit = headers["ratelimit-limit"];
    const remaining = headers["ratelimit-remaining"];
    const reset = headers["ratelimit-reset"];

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset) * 1000, // Convert to milliseconds
      };
    }
  }

  private transformError(error: AxiosError<ApiErrorResponse>): any {
    if (error.response) {
      // Server responded with error
      logger.error("API Error", "Axios Interceptor", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        message: error.response.data?.message,
        errors: error.response.data?.errors,
      });

      return {
        message: error.response.data?.message || "An error occurred",
        statusCode: error.response.status,
        errors: error.response.data?.errors,
        isApiError: true,
      };
    } else if (error.request) {
      // Request made but no response
      logger.error("Network Error", "Axios Interceptor", {
        url: error.config?.url,
        method: error.config?.method,
        message: "No response received from server",
      });

      return {
        message: "Network error. Please check your connection.",
        statusCode: 0,
        isNetworkError: true,
      };
    } else {
      // Something else happened
      logger.error("Unexpected Error", "Axios Interceptor", {
        message: error.message,
      });

      return {
        message: error.message || "An unexpected error occurred",
        statusCode: 0,
      };
    }
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
export const axiosInstance = apiClient.getAxiosInstance();
