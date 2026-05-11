const axios = require('axios');
const cron = require('node-cron');
const ExchangeRate = require('../models/ExchangeRate');

const BASE = 'TND';
const FALLBACK_RATES = {
  TND: 1,
  EUR: 0.29,
  USD: 0.32,
  GBP: 0.25,
  CHF: 0.28,
  CAD: 0.44,
  JPY: 49,
  AED: 1.17,
  SAR: 1.2,
  DZD: 43,
  MAD: 3.2,
  EGP: 15,
};

const fetchFromApi = async () => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://v6.exchangerate-api.com/v6';

  if (!apiKey) {
    return { rates: FALLBACK_RATES, provider: 'fallback' };
  }

  const url = `${apiUrl}/${apiKey}/latest/${BASE}`;
  const { data } = await axios.get(url, { timeout: 10000 });

  if (data.result !== 'success' || !data.conversion_rates) {
    throw new Error(data['error-type'] || 'ExchangeRate API returned an unexpected payload');
  }

  return { rates: data.conversion_rates, provider: 'exchangerate-api' };
};

const refreshRates = async () => {
  try {
    const { rates, provider } = await fetchFromApi();
    const doc = await ExchangeRate.create({ base: BASE, rates, provider, fetchedAt: new Date() });
    console.log(`[currency] refreshed ${Object.keys(rates).length} rates via ${provider}`);
    return doc;
  } catch (err) {
    console.error('[currency] refresh failed:', err.message);
    const existing = await ExchangeRate.latest(BASE);
    if (existing) return existing;
    return ExchangeRate.create({ base: BASE, rates: FALLBACK_RATES, provider: 'fallback' });
  }
};

const getLatestRates = async () => {
  let doc = await ExchangeRate.latest(BASE);
  if (!doc) {
    doc = await refreshRates();
  }
  return doc;
};

const convert = async ({ from, to, amount }) => {
  const doc = await getLatestRates();
  const rates = doc.rates instanceof Map ? Object.fromEntries(doc.rates) : doc.rates;

  const fromRate = from === BASE ? 1 : rates[from];
  const toRate = to === BASE ? 1 : rates[to];

  if (!fromRate || !toRate) {
    const err = new Error(`Unsupported currency: ${!fromRate ? from : to}`);
    err.statusCode = 400;
    throw err;
  }

  const amountInBase = amount / fromRate;
  const converted = amountInBase * toRate;

  return {
    from,
    to,
    amount,
    convertedAmount: Math.round(converted * 10000) / 10000,
    rate: Math.round((toRate / fromRate) * 10000) / 10000,
    fetchedAt: doc.fetchedAt,
    provider: doc.provider,
  };
};

let scheduled = false;
const scheduleDailyRefresh = () => {
  if (scheduled) return;
  scheduled = true;
  cron.schedule('0 3 * * *', refreshRates, { timezone: 'Africa/Tunis' });
  console.log('[currency] daily refresh scheduled at 03:00 Africa/Tunis');

  ExchangeRate.latest(BASE).then((doc) => {
    if (!doc) refreshRates();
  });
};

module.exports = {
  BASE,
  refreshRates,
  getLatestRates,
  convert,
  scheduleDailyRefresh,
};
