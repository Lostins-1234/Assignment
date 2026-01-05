export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // gCO₂e/MJ
  fuelConsumption: number; // tons
  distance: number; // km
  totalEmissions: number; // tons
  isBaseline: boolean;
}

export interface RouteComparison {
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
}

export const TARGET_INTENSITY_2025 = 89.3368; // gCO₂e/MJ (2% below 91.16)
export const ENERGY_CONVERSION_FACTOR = 41000; // MJ per ton of fuel

export function calculateComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  fuelConsumption: number // tons
): number {
  const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR; // MJ
  const cb = (targetIntensity - actualIntensity) * energyInScope; // gCO₂eq
  return cb;
}

export function calculatePercentDifference(baseline: number, comparison: number): number {
  return ((comparison / baseline) - 1) * 100;
}

export function isCompliant(intensity: number, targetIntensity: number = TARGET_INTENSITY_2025): boolean {
  return intensity <= targetIntensity;
}




