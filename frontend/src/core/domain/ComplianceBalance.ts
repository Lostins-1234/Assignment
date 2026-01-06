export interface ComplianceBalance {
  id?: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  cbBefore: number;
  appliedBanked: number;
  cbAfter: number;
}




