// ─── Address ──────────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pinCode: string;
  label: 'Home' | 'Office' | 'Godown' | 'Other';
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  whatsapp: boolean;
}

// ─── Customer ─────────────────────────────────────────────────────────────────
export type CustomerGroup = 'Wholesale' | 'Retail' | 'Export';
export type RegType = 'Regular' | 'Composition' | 'Unregistered' | 'SEZ' | 'Export';
export type CustomerStatus = 'Active' | 'Inactive' | 'Overdue';
export type PaymentTerms = 'Immediate' | '15 days' | '30 days' | '45 days' | '60 days';

export interface Customer {
  id: string;
  code: string;
  legalName: string;
  tradeName: string;
  group: CustomerGroup;
  phone: string;
  altPhone: string;
  email: string;
  city: string;
  state: string;
  pinCode: string;
  gstin: string;
  pan: string;
  stateCode: string;
  regType: RegType;
  creditLimit: number;
  creditPeriod: number;
  overdueRate: number;
  priceList: string;
  paymentTerms: PaymentTerms;
  broker: string;
  billingAddresses: Address[];
  shippingAddresses: Address[];
  contacts: Contact[];
  outstanding: number;
  status: CustomerStatus;
  lastTransaction: string | null;
}

// ─── Product / SKU ────────────────────────────────────────────────────────────
export type GSTRate = 5 | 12 | 18;

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  hsn: string;
  gstRate: GSTRate;
  primaryUnit: string;
  secondaryUnit: string;
  conversionRatio: number; // meters per piece
  currentStock: number; // in primary unit (meters)
  lotCount: number;
  lowStockThreshold: number;
  costRate: number;
  sellingRate: number;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
export type InvoiceType = 'Tax Invoice' | 'Estimate' | 'Final Invoice' | 'Draft Invoice';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'PART-PAID' | 'CANCELLED';
export type PaymentMode = 'Cash' | 'UPI' | 'Cheque' | 'NEFT' | 'RTGS';

export interface InvoiceLine {
  id: string;
  productId: string;
  sku: string;
  name: string;
  variant: string;
  hsn: string;
  qtyPrimary: number;   // meters
  qtySecondary: number; // pieces
  rate: number;
  discount: number;
  taxableAmount: number;
  gstRate: GSTRate;
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  lineTotal: number;
}

export interface Payment {
  id: string;
  amount: number;
  mode: PaymentMode;
  referenceNo: string;
  date: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  customerId: string;
  customerName: string;
  customerGSTIN: string;
  customerState: string;
  lines: InvoiceLine[];
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  igst: number;
  freight: number;
  roundOff: number;
  total: number;
  status: InvoiceStatus;
  irn: string | null;
  ewayBillNo: string | null;
  dispatchDate: string | null;
  terms: string;
  transporter: string;
  vehicleNo: string;
  paymentTerms: PaymentTerms;
  bankAccount: string;
  notes: string;
  payments: Payment[];
  createdAt: string;
  issuedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
}

// ─── Lot / Warehouse ──────────────────────────────────────────────────────────
export interface Lot {
  id: string;
  lotNo: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  costRate: number;
  warehouse: string;
  date: string;
}

// ─── App State ────────────────────────────────────────────────────────────────
export type Page = 'dashboard' | 'customers' | 'invoice' | 'inventory' | 'reports' | 'settings';

export interface AppState {
  currentPage: Page;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  lots: Lot[];
  invoiceCounter: number;
  recentCustomerIds: string[];
  isAuthenticated: boolean;
}

export type AppAction =
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'ADD_PAYMENT'; payload: { invoiceId: string; payment: Payment } }
  | { type: 'ADD_LOT'; payload: Lot }
  | { type: 'SET_RECENT_CUSTOMER'; payload: string }
  | { type: 'INCREMENT_INVOICE_COUNTER' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'BULK_ADD_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_PRODUCT'; payload: Product };
