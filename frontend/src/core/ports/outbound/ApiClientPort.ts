export interface ApiClientPort {
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
  post<T>(path: string, data?: any): Promise<T>;
  put<T>(path: string, data?: any): Promise<T>;
  delete<T>(path: string): Promise<T>;
}




