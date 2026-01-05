import { BankEntry } from '../../domain/Banking';

export interface BankingRepositoryPort {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;

  save(bankEntry: Omit<BankEntry, 'id'>): Promise<BankEntry>;

  getTotalBanked(shipId: string, year: number): Promise<number>;
}




