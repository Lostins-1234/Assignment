import { Route, RouteComparison } from '../domain/Route';
import { RouteServicePort } from '../ports/inbound/RouteServicePort';
import { ApiClientPort } from '../ports/outbound/ApiClientPort';

export class RouteService implements RouteServicePort {
  constructor(private apiClient: ApiClientPort) {}

  async getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    return this.apiClient.get<Route[]>('/routes', filters);
  }

  async setBaseline(routeId: string): Promise<Route> {
    return this.apiClient.post<Route>(`/routes/${routeId}/baseline`);
  }

  async getComparison(targetIntensity?: number): Promise<RouteComparison[]> {
    const params = targetIntensity ? { targetIntensity } : undefined;
    return this.apiClient.get<RouteComparison[]>('/routes/comparison', params);
  }
}




