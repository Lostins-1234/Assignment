import { CreatePoolRequest, CreatePoolResult } from '../../domain/Pool';

export interface PoolServicePort {
  createPool(request: CreatePoolRequest): Promise<CreatePoolResult>;
}




