import { BankEntry, BankingResult, ApplyBankingResult } from '../../domain/Banking';

export interface BankingServicePort {
  getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;

  bankSurplus(shipId: string, year: number, amountGco2eq: number): Promise<BankingResult>;

  applyBanked(shipId: string, year: number, amountGco2eq: number): Promise<ApplyBankingResult>;
}




