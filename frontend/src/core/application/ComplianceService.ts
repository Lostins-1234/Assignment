import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/ComplianceBalance';
import { ComplianceServicePort } from '../ports/inbound/ComplianceServicePort';
import { ApiClientPort } from '../ports/outbound/ApiClientPort';

export class ComplianceService implements ComplianceServicePort {
  constructor(private apiClient: ApiClientPort) {}

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    try {
      return await this.apiClient.get<ComplianceBalance>('/compliance/cb', { shipId, year });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
    try {
      return await this.apiClient.get<AdjustedComplianceBalance>('/compliance/adjusted-cb', { shipId, year });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async calculateComplianceBalance(shipId: string, routeId: string, year: number): Promise<ComplianceBalance> {
    return await this.apiClient.post<ComplianceBalance>('/compliance/calculate', {
      shipId,
      routeId,
      year,
    });
  }
}


