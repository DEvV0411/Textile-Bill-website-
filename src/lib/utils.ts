// ─── Indian Number Formatting ─────────────────────────────────────────────────
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatINR(amount);
}

// ─── Amount in Words (Indian system) ─────────────────────────────────────────
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
}

export function amountToWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  
  let words = '';
  if (rupees === 0) {
    words = 'Zero';
  } else {
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const rest = rupees % 1000;
    
    if (crore) words += numToWords(crore) + ' Crore ';
    if (lakh) words += numToWords(lakh) + ' Lakh ';
    if (thousand) words += numToWords(thousand) + ' Thousand ';
    if (rest) words += numToWords(rest);
  }
  
  words = words.trim() + ' Rupees';
  if (paise) words += ' and ' + numToWords(paise) + ' Paise';
  words += ' Only';
  return words;
}

// ─── Invoice Number Generation ────────────────────────────────────────────────
export function generateInvoiceNumber(counter: number): string {
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  const fy = `${year}-${String(nextYear).slice(2)}`;
  return `INV/${fy}/${String(counter).padStart(4, '0')}`;
}

// ─── ID Generation ────────────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Customer Code Generation ─────────────────────────────────────────────────
export function generateCustomerCode(count: number): string {
  return `CUST-${String(count).padStart(4, '0')}`;
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Validation ───────────────────────────────────────────────────────────────
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function getStateCodeFromGSTIN(gstin: string): string {
  return gstin.length >= 2 ? gstin.slice(0, 2) : '';
}

// ─── Credit Usage ─────────────────────────────────────────────────────────────
export function creditUsagePercent(outstanding: number, creditLimit: number): number {
  if (!creditLimit) return 0;
  return Math.min(100, Math.round((outstanding / creditLimit) * 100));
}

// ─── Cn (class names helper) ──────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
