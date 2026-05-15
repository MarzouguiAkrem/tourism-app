import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope } from '../types/api';
import { ConvertResponse, ExchangeRates } from '../types/currency';

export const currencyService = {
  async rates(): Promise<ExchangeRates> {
    const { data } = await api.get<ApiEnvelope<ExchangeRates>>(ENDPOINTS.CURRENCY.RATES);
    return data.data;
  },

  async convert(from: string, to: string, amount: number): Promise<ConvertResponse> {
    const { data } = await api.get<ApiEnvelope<ConvertResponse>>(
      ENDPOINTS.CURRENCY.CONVERT,
      { params: { from, to, amount } }
    );
    return data.data;
  },
};
