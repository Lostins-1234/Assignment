import { ComplianceBalance, AdjustedComplianceBalance } from '../../domain/ComplianceBalance';

export interface ComplianceServicePort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null>;

  calculateAndStoreComplianceBalance(
    shipId: string,
    routeId: string,
    year: number
  ): Promise<ComplianceBalance>;

  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null>;
}




