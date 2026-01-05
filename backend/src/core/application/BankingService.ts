import { BankingResult, ApplyBankingResult } from '../domain/Banking';
import { BankingServicePort } from '../ports/inbound/BankingServicePort';
import { ComplianceRepositoryPort } from '../ports/outbound/ComplianceRepositoryPort';
import { BankingRepositoryPort } from '../ports/outbound/BankingRepositoryPort';

export class BankingService implements BankingServicePort {
  constructor(
    private complianceRepository: ComplianceRepositoryPort,
    private bankingRepository: BankingRepositoryPort
  ) {}

  async getBankRecords(shipId: string, year: number) {
    return this.bankingRepository.findByShipAndYear(shipId, year);
  }

  async bankSurplus(shipId: string, year: number, amountGco2eq: number): Promise<BankingResult> {
    if (amountGco2eq <= 0) {
      throw new Error('Can only bank positive amounts');
    }

    // Get current CB
    const cb = await this.complianceRepository.findByShipAndYear(shipId, year);
    if (!cb) {
      throw new Error(`No compliance balance found for ship ${shipId} in year ${year}`);
    }

    if (cb.cbGco2eq <= 0) {
      throw new Error('Can only bank positive compliance balance (surplus)');
    }

    if (amountGco2eq > cb.cbGco2eq) {
      throw new Error('Cannot bank more than available surplus');
    }

    // Create bank entry
    await this.bankingRepository.save({
      shipId,
      year,
      amountGco2eq,
    });

    // Update CB (reduce by banked amount)
    const cbAfter = cb.cbGco2eq - amountGco2eq;
    await this.complianceRepository.save({
      ...cb,
      cbGco2eq: cbAfter,
    });

    return {
      cbBefore: cb.cbGco2eq,
      banked: amountGco2eq,
      cbAfter,
    };
  }

  async applyBanked(shipId: string, year: number, amountGco2eq: number): Promise<ApplyBankingResult> {
    if (amountGco2eq <= 0) {
      throw new Error('Can only apply positive amounts');
    }

    // Get current CB
    const cb = await this.complianceRepository.findByShipAndYear(shipId, year);
    if (!cb) {
      throw new Error(`No compliance balance found for ship ${shipId} in year ${year}`);
    }

    // Check available banked amount
    // Note: In a real system, we'd track applied amounts separately
    // For simplicity, we'll assume banked amounts can be fully applied
    const totalBanked = await this.bankingRepository.getTotalBanked(shipId, year);

    if (amountGco2eq > totalBanked) {
      throw new Error(`Cannot apply more than available banked amount: ${totalBanked}`);
    }

    // Apply banked amount to CB
    const cbAfter = cb.cbGco2eq + amountGco2eq;
    await this.complianceRepository.save({
      ...cb,
      cbGco2eq: cbAfter,
    });

    return {
      cbBefore: cb.cbGco2eq,
      applied: amountGco2eq,
      cbAfter,
    };
  }
}
