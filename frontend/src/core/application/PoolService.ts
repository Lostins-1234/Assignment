import { CreatePoolRequest, CreatePoolResult } from '../domain/Pool';
import { PoolServicePort } from '../ports/inbound/PoolServicePort';
import { ApiClientPort } from '../ports/outbound/ApiClientPort';

export class PoolService implements PoolServicePort {
  constructor(private apiClient: ApiClientPort) {}

  async createPool(request: CreatePoolRequest): Promise<CreatePoolResult> {
    return this.apiClient.post<CreatePoolResult>('/pools', request);
  }
}




