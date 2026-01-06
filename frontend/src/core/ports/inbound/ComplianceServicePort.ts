import { ComplianceBalance, AdjustedComplianceBalance } from '../../domain/ComplianceBalance';

export interface ComplianceServicePort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null>;

  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null>;

  calculateComplianceBalance(shipId: string, routeId: string, year: number): Promise<ComplianceBalance>;
}


