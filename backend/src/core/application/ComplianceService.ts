import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/ComplianceBalance';
import { calculateComplianceBalance, TARGET_INTENSITY_2025 } from '../domain/Route';
import { ComplianceServicePort } from '../ports/inbound/ComplianceServicePort';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';
import { ComplianceRepositoryPort } from '../ports/outbound/ComplianceRepositoryPort';
import { BankingRepositoryPort } from '../ports/outbound/BankingRepositoryPort';

export class ComplianceService implements ComplianceServicePort {
  constructor(
    private routeRepository: RouteRepositoryPort,
    private complianceRepository: ComplianceRepositoryPort,
    private bankingRepository: BankingRepositoryPort
  ) {}

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.complianceRepository.findByShipAndYear(shipId, year);
  }

  async calculateAndStoreComplianceBalance(
    shipId: string,
    routeId: string,
    year: number
  ): Promise<ComplianceBalance> {
    // Get route data
    const route = await this.routeRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route with routeId ${routeId} not found`);
    }

    // Calculate CB
    const cbGco2eq = calculateComplianceBalance(
      TARGET_INTENSITY_2025,
      route.ghgIntensity,
      route.fuelConsumption
    );

    // Store or update
    const existing = await this.complianceRepository.findByShipAndYear(shipId, year);
    const compliance: ComplianceBalance = {
      shipId,
      year,
      cbGco2eq,
    };

    if (existing) {
      // Update existing
      return this.complianceRepository.save({ ...compliance, id: existing.id });
    } else {
      // Create new
      return this.complianceRepository.save(compliance);
    }
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
    const cb = await this.complianceRepository.findByShipAndYear(shipId, year);
    if (!cb) {
      return null;
    }

    // Calculate applied banked amount
    const totalBanked = await this.bankingRepository.getTotalBanked(shipId, year);
    const applied = Math.min(totalBanked, Math.max(0, -cb.cbGco2eq)); // Can only apply to cover deficit
    const cbAfter = cb.cbGco2eq + applied;

    return {
      ...cb,
      cbBefore: cb.cbGco2eq,
      appliedBanked: applied,
      cbAfter,
    };
  }
}




