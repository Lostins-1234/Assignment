import { Pool, PoolMember, PoolAllocation } from '../../domain/Pool';

export interface PoolRepositoryPort {
  save(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<Pool>;

  saveMembers(poolId: string, members: Omit<PoolMember, 'id' | 'poolId'>[]): Promise<PoolMember[]>;
}




