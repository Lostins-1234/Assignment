import { Route } from '../../../core/domain/Route';
import { RouteRepositoryPort } from '../../../core/ports/outbound/RouteRepositoryPort';
import { PrismaClient } from '@prisma/client';

export class PrismaRouteRepository implements RouteRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    const routes = await this.prisma.route.findMany({
      where: {
        ...(filters?.vesselType && { vesselType: filters.vesselType }),
        ...(filters?.fuelType && { fuelType: filters.fuelType }),
        ...(filters?.year && { year: filters.year }),
      },
    });

    return routes.map(this.toDomain);
  }

  async findById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });

    return route ? this.toDomain(route) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { routeId },
    });

    return route ? this.toDomain(route) : null;
  }

  async update(route: Route): Promise<Route> {
    if (!route.id) {
      throw new Error('Route id is required for update');
    }

    const updated = await this.prisma.route.update({
      where: { id: route.id },
      data: {
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        fuelConsumption: route.fuelConsumption,
        distance: route.distance,
        totalEmissions: route.totalEmissions,
        isBaseline: route.isBaseline,
      },
    });

    return this.toDomain(updated);
  }

  async save(route: Route): Promise<Route> {
    if (route.id) {
      return this.update(route);
    }

    // Try to find by routeId first to handle upserts
    const existing = await this.prisma.route.findUnique({
      where: { routeId: route.routeId },
    });

    if (existing) {
      // Update existing
      return this.update({ ...route, id: existing.id });
    }

    const created = await this.prisma.route.create({
      data: {
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        fuelConsumption: route.fuelConsumption,
        distance: route.distance,
        totalEmissions: route.totalEmissions,
        isBaseline: route.isBaseline,
      },
    });

    return this.toDomain(created);
  }

  private toDomain(route: any): Route {
    return {
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
    };
  }
}
