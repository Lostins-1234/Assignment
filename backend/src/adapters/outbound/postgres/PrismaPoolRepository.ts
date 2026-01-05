import { Pool, PoolMember, PoolAllocation } from '../../../core/domain/Pool';
import { PoolRepositoryPort } from '../../../core/ports/outbound/PoolRepositoryPort';
import { PrismaClient } from '@prisma/client';

export class PrismaPoolRepository implements PoolRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async save(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<Pool> {
    const created = await this.prisma.pool.create({
      data: {
        year: pool.year,
      },
    });

    return {
      id: created.id,
      year: created.year,
      createdAt: created.createdAt,
    };
  }

  async saveMembers(poolId: string, members: Omit<PoolMember, 'id' | 'poolId'>[]): Promise<PoolMember[]> {
    const created = await this.prisma.poolMember.createMany({
      data: members.map((m) => ({
        poolId,
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter,
      })),
    });

    // Fetch created members to return full objects
    const saved = await this.prisma.poolMember.findMany({
      where: { poolId },
    });

    return saved.map(this.toDomain);
  }

  private toDomain(member: any): PoolMember {
    return {
      id: member.id,
      poolId: member.poolId,
      shipId: member.shipId,
      cbBefore: member.cbBefore,
      cbAfter: member.cbAfter,
    };
  }
}




