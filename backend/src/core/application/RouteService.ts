import { Route, RouteComparison, TARGET_INTENSITY_2025, calculatePercentDifference, isCompliant } from '../domain/Route';
import { RouteServicePort } from '../ports/inbound/RouteServicePort';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';

export class RouteService implements RouteServicePort {
  constructor(private routeRepository: RouteRepositoryPort) {}

  async getAllRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    return this.routeRepository.findAll(filters);
  }

  async getRouteById(id: string): Promise<Route | null> {
    return this.routeRepository.findById(id);
  }

  async setBaseline(routeId: string): Promise<Route> {
    // Find the route
    const route = await this.routeRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route with routeId ${routeId} not found`);
    }

    // Clear ALL baselines (across all years) to ensure only one baseline exists
    // This prevents confusion and ensures consistent comparison behavior
    const allRoutes = await this.routeRepository.findAll();
    const baselineUpdates = allRoutes
      .filter(r => r.isBaseline && r.id !== route.id)
      .map(r => {
        r.isBaseline = false;
        return this.routeRepository.update(r);
      });
    
    // Wait for all baseline clears to complete
    await Promise.all(baselineUpdates);

    // Set this route as baseline
    route.isBaseline = true;
    return this.routeRepository.update(route);
  }

  async getComparison(targetIntensity: number = TARGET_INTENSITY_2025): Promise<RouteComparison[]> {
    const allRoutes = await this.routeRepository.findAll();
    
    // Find baseline route
    const baseline = allRoutes.find(r => r.isBaseline);
    if (!baseline) {
      throw new Error('No baseline route set');
    }

    // Compare all non-baseline routes with baseline
    const comparisons: RouteComparison[] = [];
    for (const route of allRoutes) {
      if (route.id !== baseline.id) {
        const percentDiff = calculatePercentDifference(baseline.ghgIntensity, route.ghgIntensity);
        const compliant = isCompliant(route.ghgIntensity, targetIntensity);
        
        comparisons.push({
          baseline,
          comparison: route,
          percentDiff,
          compliant,
        });
      }
    }

    return comparisons;
  }
}


