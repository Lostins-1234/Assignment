import { BankEntry, BankingResult, ApplyBankingResult } from '../domain/Banking';
import { BankingServicePort } from '../ports/inbound/BankingServicePort';
import { ApiClientPort } from '../ports/outbound/ApiClientPort';

export class BankingService implements BankingServicePort {
  constructor(private apiClient: ApiClientPort) {}

  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.apiClient.get<BankEntry[]>('/banking/records', { shipId, year });
  }

  async bankSurplus(shipId: string, year: number, amountGco2eq: number): Promise<BankingResult> {
    return this.apiClient.post<BankingResult>('/banking/bank', { shipId, year, amountGco2eq });
  }

  async applyBanked(shipId: string, year: number, amountGco2eq: number): Promise<ApplyBankingResult> {
    return this.apiClient.post<ApplyBankingResult>('/banking/apply', { shipId, year, amountGco2eq });
  }
}




