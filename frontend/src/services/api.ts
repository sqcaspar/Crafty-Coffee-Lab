// Base API configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('API_BASE_URL:', API_BASE_URL); // Debug log to verify URL

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// API Client class for centralized request handling
export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic request method with error handling and retry logic
  private async request<T = any>(
    endpoint: string,
    options: (RequestInit & { timeout?: number }) = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Build full URL - ensure we use absolute URL for external APIs
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    console.log('Making request to:', fullUrl); // Debug log

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const error: ApiError = {
          message: data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: data,
        };
        
        return {
          success: false,
          error: error.message,
          data: error.details,
        };
      }

      // Handle backend response format
      if (typeof data === 'object' && data !== null) {
        if ('success' in data) {
          return data as ApiResponse<T>;
        } else {
          // If backend doesn't use ApiResponse format, wrap the data
          return {
            success: true,
            data: data as T,
          };
        }
      }

      return {
        success: true,
        data: data as T,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - please check your connection and try again',
          };
        }

        return {
          success: false,
          error: error.message || 'Network error occurred',
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // HTTP method helpers
  async get<T = any>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: RequestInit & { timeout?: number }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(endpoint: string, body?: any, options?: RequestInit & { timeout?: number }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Retry mechanism for failed requests
  async requestWithRetry<T = any>(
    endpoint: string,
    options: (RequestInit & { timeout?: number }) = {},
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiResponse<T>;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await this.request<T>(endpoint, options);
      
      if (response.success) {
        return response;
      }

      lastError = response;

      // Don't retry on client errors (4xx) except 408 (timeout)
      if (typeof response.data === 'object' && response.data && 'status' in response.data) {
        const status = (response.data as any).status;
        if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408) {
          break;
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }

    return lastError!;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/api/health');
      return Boolean(response.success);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const handleApiError = (error: ApiResponse): string => {
  return error.error || 'An unexpected error occurred';
};

export const isNetworkError = (error: ApiResponse): boolean => {
  return !error.success && Boolean(
    error.error?.includes('Network error') ||
    error.error?.includes('timeout') ||
    error.error?.includes('connection')
  );
};