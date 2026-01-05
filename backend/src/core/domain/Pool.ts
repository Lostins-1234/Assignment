export interface Pool {
  id: string;
  year: number;
  createdAt: Date;
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolAllocation {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolRequest {
  year: number;
  memberShipIds: string[];
}

export interface CreatePoolResult {
  poolId: string;
  allocations: PoolAllocation[];
  totalCbBefore: number;
  totalCbAfter: number;
  valid: boolean;
}




