export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  provider: string;
}

export interface ConvertResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  fetchedAt: string;
  provider: string;
}
