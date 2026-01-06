import { useMemo } from 'react';
import { ApiClient } from '../../adapters/infrastructure/ApiClient';
import { RouteService } from '../../core/application/RouteService';
import { ComplianceService } from '../../core/application/ComplianceService';
import { BankingService } from '../../core/application/BankingService';
import { PoolService } from '../../core/application/PoolService';

export function useServices() {
  return useMemo(() => {
    const apiClient = new ApiClient();
    return {
      routeService: new RouteService(apiClient),
      complianceService: new ComplianceService(apiClient),
      bankingService: new BankingService(apiClient),
      poolService: new PoolService(apiClient),
    };
  }, []);
}




