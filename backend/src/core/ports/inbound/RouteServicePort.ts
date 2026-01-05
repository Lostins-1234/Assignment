import { Route, RouteComparison } from '../../domain/Route';

export interface RouteServicePort {
  getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;

  getRouteById(id: string): Promise<Route | null>;

  setBaseline(routeId: string): Promise<Route>;

  getComparison(targetIntensity?: number): Promise<RouteComparison[]>;
}




