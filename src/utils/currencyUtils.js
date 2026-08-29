/**
 * Central Dual & Location-Based Currency Utility (USD $ & INR ₹)
 * Standard benchmark rate: 1 USD = 83.50 INR
 */

export const USD_TO_INR_RATE = 83.50;
export const INR_TO_USD_RATE = 1 / USD_TO_INR_RATE; // ~0.011976

/**
 * Cleanly extracts numerical values from raw currency strings like "$10,000" or "₹4,50,000"
 */
export function parseCurrencyAmount(val) {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  const cleaned = str.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return num;
}

/**
 * Checks if a location string represents India / Domestic account
 */
export function isIndiaLocation(locationStr) {
  if (!locationStr) return true; // Default to India/domestic if unspecified
  const loc = String(locationStr).toLowerCase();
  const indiaKeywords = [
    'india', 'in', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 
    'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon', 'noida', 
    'domestic', 'ahmedabad', 'karnataka', 'maharashtra', 'telangana'
  ];
  return indiaKeywords.some(kw => loc.includes(kw));
}

/**
 * Formats amount into SINGLE currency based on location:
 * - India / Domestic -> INR (₹)
 * - Outside India / International -> USD ($)
 */
export function formatCurrencyByLocation(amountInINR, locationStr) {
  const isIndia = isIndiaLocation(locationStr);
  const numINR = Math.round(Number(amountInINR) || 0);
  
  if (isIndia) {
    return `₹${numINR.toLocaleString('en-IN')}`;
  } else {
    const numUSD = Math.round(numINR * INR_TO_USD_RATE);
    return `$${numUSD.toLocaleString()} USD`;
  }
}

/**
 * Formats amount into Lakhs (INR) or USD based on location:
 * - India -> ₹X.XX Lakhs
 * - Outside India -> $X,XXX USD
 */
export function formatLakhsOrUsdByLocation(amountInINR, locationStr) {
  const isIndia = isIndiaLocation(locationStr);
  const numINR = Number(amountInINR) || 0;

  if (isIndia) {
    const lakhs = (numINR / 100000).toFixed(2);
    return `₹${lakhs}L`;
  } else {
    const numUSD = Math.round(numINR * INR_TO_USD_RATE);
    return `$${numUSD.toLocaleString()} USD`;
  }
}

/**
 * Returns formatted Dual Currency string e.g. "₹5,00,000 ($5,988 USD)"
 */
export function formatDualCurrency(amountInINR, primary = 'INR') {
  const numINR = Math.round(Number(amountInINR) || 0);
  const numUSD = Math.round(numINR * INR_TO_USD_RATE);

  const formattedINR = `₹${numINR.toLocaleString('en-IN')}`;
  const formattedUSD = `$${numUSD.toLocaleString()} USD`;

  if (primary === 'USD') {
    return `${formattedUSD} (${formattedINR})`;
  }
  return `${formattedINR} (${formattedUSD})`;
}

/**
 * Returns formatted Dual Currency Lakhs string e.g. "₹9.89L ($11,844 USD)"
 */
export function formatDualLakhs(amountInINR) {
  const numINR = Number(amountInINR) || 0;
  const lakhs = (numINR / 100000).toFixed(2);
  const numUSD = Math.round(numINR * INR_TO_USD_RATE);

  return `₹${lakhs}L ($${numUSD.toLocaleString()} USD)`;
}
