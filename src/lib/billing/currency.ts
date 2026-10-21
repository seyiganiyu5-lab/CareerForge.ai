/**
 * Currencies customers can pay in. Which ones are offered is set with
 * PAYMENT_CURRENCIES (e.g. "NGN,USD"), because it depends on what the
 * Paystack account is allowed to accept: NGN for Nigerian businesses, USD
 * once Paystack approves international payments, XOF for businesses
 * registered in Côte d'Ivoire.
 */
export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'XOF'] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

// Safe default: a new Paystack account (Nigeria) only accepts NGN until
// Paystack approves international payments
const DEFAULT_CURRENCIES = 'NGN';

// West African CFA franc (UEMOA) countries
const XOF_COUNTRIES = new Set(['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG']);

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function enabledCurrencies(): Currency[] {
  const list = (process.env.PAYMENT_CURRENCIES || DEFAULT_CURRENCIES)
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(isCurrency);
  return list.length ? [...new Set(list)] : ['USD'];
}

/** The visitor's country, from the hosting provider's geo header (Vercel, Cloudflare). */
export function requestCountry(headers: Headers): string | null {
  return (headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || '').toUpperCase() || null;
}

export function currencyForCountry(country: string | null): Currency {
  if (country === 'NG') return 'NGN';
  if (country && XOF_COUNTRIES.has(country)) return 'XOF';
  return 'USD';
}

/**
 * The currency to charge in: the one the customer picked if it is offered,
 * otherwise their country's currency, otherwise USD, otherwise the first offered
 * (also used when the country is unknown).
 */
export function pickCurrency(requested: unknown, country: string | null): Currency {
  const enabled = enabledCurrencies();
  if (isCurrency(requested) && enabled.includes(requested)) return requested;
  // Country unknown (e.g. localhost): the first currency in PAYMENT_CURRENCIES
  if (!country) return enabled[0];
  const local = currencyForCountry(country);
  if (enabled.includes(local)) return local;
  return enabled.includes('USD') ? 'USD' : enabled[0];
}
