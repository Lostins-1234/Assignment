import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiClientPort } from '../../core/ports/outbound/ApiClientPort';

export class ApiClient implements ApiClientPort {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const errorMessage = (error.response.data as any)?.error || error.message;
          console.error(`API Error [${error.response.status}]:`, {
            path: error.config?.url,
            method: error.config?.method,
            error: errorMessage,
            data: error.response.data,
          });
          
          // Create a more descriptive error
          const enhancedError = new Error(errorMessage);
          (enhancedError as any).status = error.response.status;
          (enhancedError as any).data = error.response.data;
          return Promise.reject(enhancedError);
        } else if (error.request) {
          // Request was made but no response received
          console.error('Network Error: No response from server', {
            path: error.config?.url,
            method: error.config?.method,
          });
          const networkError = new Error('Unable to connect to server. Please ensure the backend server is running on port 3001.');
          (networkError as any).isNetworkError = true;
          return Promise.reject(networkError);
        } else {
          // Something else happened
          console.error('Request Error:', error.message);
          return Promise.reject(error);
        }
      }
    );
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(path, { params });
    return response.data;
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(path, data);
    return response.data;
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(path, data);
    return response.data;
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.client.delete<T>(path);
    return response.data;
  }
}


