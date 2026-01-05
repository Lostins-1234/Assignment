import { ComplianceBalance } from '../../domain/ComplianceBalance';

export interface ComplianceRepositoryPort {
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;

  save(compliance: ComplianceBalance): Promise<ComplianceBalance>;
  
  findById(id: string): Promise<ComplianceBalance | null>;
}
