import { BankEntry } from '../../../core/domain/Banking';
import { BankingRepositoryPort } from '../../../core/ports/outbound/BankingRepositoryPort';
import { PrismaClient } from '@prisma/client';

export class PrismaBankingRepository implements BankingRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: {
        shipId,
        year,
      },
    });

    return entries.map(this.toDomain);
  }

  async save(bankEntry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
    const created = await this.prisma.bankEntry.create({
      data: {
        shipId: bankEntry.shipId,
        year: bankEntry.year,
        amountGco2eq: bankEntry.amountGco2eq,
      },
    });

    return this.toDomain(created);
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: {
        shipId,
        year,
      },
      _sum: {
        amountGco2eq: true,
      },
    });

    return result._sum.amountGco2eq || 0;
  }

  private toDomain(entry: any): BankEntry {
    return {
      id: entry.id,
      shipId: entry.shipId,
      year: entry.year,
      amountGco2eq: entry.amountGco2eq,
    };
  }
}




