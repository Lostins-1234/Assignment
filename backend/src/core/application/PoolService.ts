import { CreatePoolRequest, CreatePoolResult, PoolAllocation } from '../domain/Pool';
import { PoolServicePort } from '../ports/inbound/PoolServicePort';
import { ComplianceRepositoryPort } from '../ports/outbound/ComplianceRepositoryPort';
import { PoolRepositoryPort } from '../ports/outbound/PoolRepositoryPort';

export class PoolService implements PoolServicePort {
  constructor(
    private complianceRepository: ComplianceRepositoryPort,
    private poolRepository: PoolRepositoryPort
  ) {}

  async createPool(request: CreatePoolRequest): Promise<CreatePoolResult> {
    const { year, memberShipIds } = request;

    if (memberShipIds.length === 0) {
      throw new Error('Pool must have at least one member');
    }

    // Get CB for all members
    const memberCBs = await Promise.all(
      memberShipIds.map(async (shipId) => {
        const cb = await this.complianceRepository.findByShipAndYear(shipId, year);
        if (!cb) {
          throw new Error(`No compliance balance found for ship ${shipId} in year ${year}`);
        }
        return { shipId, cb: cb.cbGco2eq };
      })
    );

    // Calculate total CB
    const totalCbBefore = memberCBs.reduce((sum, m) => sum + m.cb, 0);

    // Validate: Sum must be >= 0
    if (totalCbBefore < 0) {
      throw new Error(`Pool total CB (${totalCbBefore}) must be >= 0`);
    }

    // Greedy allocation algorithm
    // Sort members by CB descending (surplus first, then deficits)
    const sorted = [...memberCBs].sort((a, b) => b.cb - a.cb);

    const allocations: PoolAllocation[] = [];
    let availableSurplus = 0;

    // First pass: collect surpluses
    for (const member of sorted) {
      if (member.cb > 0) {
        availableSurplus += member.cb;
        allocations.push({
          shipId: member.shipId,
          cbBefore: member.cb,
          cbAfter: 0, // Will be calculated in second pass
        });
      } else {
        allocations.push({
          shipId: member.shipId,
          cbBefore: member.cb,
          cbAfter: member.cb, // Start with original CB
        });
      }
    }

    // Second pass: allocate surplus to deficits
    for (const allocation of allocations) {
      if (allocation.cbBefore < 0 && availableSurplus > 0) {
        const toApply = Math.min(availableSurplus, -allocation.cbBefore);
        allocation.cbAfter = allocation.cbBefore + toApply;
        availableSurplus -= toApply;
      } else if (allocation.cbBefore >= 0) {
        // Surplus members: distribute remaining surplus proportionally or set to 0
        allocation.cbAfter = 0;
      }
    }

    // Validate rules:
    // - Deficit ship cannot exit worse
    // - Surplus ship cannot exit negative
    for (const allocation of allocations) {
      if (allocation.cbBefore < 0 && allocation.cbAfter < allocation.cbBefore) {
        throw new Error(`Deficit ship ${allocation.shipId} cannot exit worse`);
      }
      if (allocation.cbBefore >= 0 && allocation.cbAfter < 0) {
        throw new Error(`Surplus ship ${allocation.shipId} cannot exit negative`);
      }
    }

    const totalCbAfter = allocations.reduce((sum, a) => sum + a.cbAfter, 0);

    // Create pool
    const pool = await this.poolRepository.save({ year });

    // Save members
    await this.poolRepository.saveMembers(
      pool.id,
      allocations.map((a) => ({
        shipId: a.shipId,
        cbBefore: a.cbBefore,
        cbAfter: a.cbAfter,
      }))
    );

    // Update compliance balances
    for (const allocation of allocations) {
      const existing = await this.complianceRepository.findByShipAndYear(allocation.shipId, year);
      if (existing) {
        await this.complianceRepository.save({
          ...existing,
          cbGco2eq: allocation.cbAfter,
        });
      }
    }

    return {
      poolId: pool.id,
      allocations,
      totalCbBefore,
      totalCbAfter,
      valid: true,
    };
  }
}
