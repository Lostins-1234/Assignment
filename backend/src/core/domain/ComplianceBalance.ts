export interface ComplianceBalance {
  id?: string; // Optional for creation, required for updates
  shipId: string;
  year: number;
  cbGco2eq: number; // Positive = Surplus, Negative = Deficit
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  cbBefore: number;
  appliedBanked: number;
  cbAfter: number;
}
