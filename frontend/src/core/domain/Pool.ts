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




