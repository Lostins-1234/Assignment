export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number; // Positive amount banked
}

export interface BankingResult {
  cbBefore: number;
  banked: number;
  cbAfter: number;
}

export interface ApplyBankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}




