import { ComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { ComplianceRepositoryPort } from '../../../core/ports/outbound/ComplianceRepositoryPort';
import { PrismaClient } from '@prisma/client';

export class PrismaComplianceRepository implements ComplianceRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
    const compliance = await this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: {
          shipId,
          year,
        },
      },
    });

    return compliance ? this.toDomain(compliance) : null;
  }

  async findById(id: string): Promise<ComplianceBalance | null> {
    const compliance = await this.prisma.shipCompliance.findUnique({
      where: { id },
    });

    return compliance ? this.toDomain(compliance) : null;
  }

  async save(compliance: ComplianceBalance): Promise<ComplianceBalance> {
    if (compliance.id) {
      // Update existing
      const updated = await this.prisma.shipCompliance.update({
        where: { id: compliance.id },
        data: {
          shipId: compliance.shipId,
          year: compliance.year,
          cbGco2eq: compliance.cbGco2eq,
        },
      });

      return this.toDomain(updated);
    } else {
      // Create new or update by shipId/year
      const upserted = await this.prisma.shipCompliance.upsert({
        where: {
          shipId_year: {
            shipId: compliance.shipId,
            year: compliance.year,
          },
        },
        update: {
          cbGco2eq: compliance.cbGco2eq,
        },
        create: {
          shipId: compliance.shipId,
          year: compliance.year,
          cbGco2eq: compliance.cbGco2eq,
        },
      });

      return this.toDomain(upserted);
    }
  }

  private toDomain(compliance: any): ComplianceBalance {
    return {
      id: compliance.id,
      shipId: compliance.shipId,
      year: compliance.year,
      cbGco2eq: compliance.cbGco2eq,
    };
  }
}




