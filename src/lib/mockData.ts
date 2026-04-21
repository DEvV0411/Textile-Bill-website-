import { Customer, Product, Lot } from './types';

// ─── Indian States ────────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export const SELLER_STATE = 'Gujarat';

// ─── Mock Customers ───────────────────────────────────────────────────────────
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    code: 'CUST-0001',
    legalName: 'Rathi Fabrics Pvt Ltd',
    tradeName: 'Rathi Fabrics',
    group: 'Wholesale',
    phone: '9825012345',
    altPhone: '9825012346',
    email: 'rathi@fabrics.com',
    city: 'Surat',
    state: 'Gujarat',
    pinCode: '395003',
    gstin: '24AABCR1234A1Z5',
    pan: 'AABCR1234A',
    stateCode: '24',
    regType: 'Regular',
    creditLimit: 500000,
    creditPeriod: 30,
    overdueRate: 18,
    priceList: 'Wholesale A',
    paymentTerms: '30 days',
    broker: 'Mahesh Broker',
    billingAddresses: [{
      id: 'ba1', line1: '12, Ring Road', line2: 'Textile Market',
      city: 'Surat', state: 'Gujarat', pinCode: '395003', label: 'Office'
    }],
    shippingAddresses: [{
      id: 'sa1', line1: '45, GIDC Estate', line2: '',
      city: 'Surat', state: 'Gujarat', pinCode: '395010', label: 'Godown'
    }],
    contacts: [{
      id: 'co1', name: 'Ramesh Rathi', role: 'Owner',
      phone: '9825012345', email: 'ramesh@rathi.com', whatsapp: true
    }],
    outstanding: 125000,
    status: 'Active',
    lastTransaction: '2026-04-15',
  },
  {
    id: 'c2',
    code: 'CUST-0002',
    legalName: 'Shah Textiles',
    tradeName: 'Shah Textiles',
    group: 'Wholesale',
    phone: '9820098765',
    altPhone: '',
    email: 'shah@textiles.in',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400013',
    gstin: '27AADCS5678B1Z2',
    pan: 'AADCS5678B',
    stateCode: '27',
    regType: 'Regular',
    creditLimit: 800000,
    creditPeriod: 45,
    overdueRate: 15,
    priceList: 'Wholesale A',
    paymentTerms: '45 days',
    broker: '',
    billingAddresses: [{
      id: 'ba2', line1: '89, Bhuleshwar', line2: '',
      city: 'Mumbai', state: 'Maharashtra', pinCode: '400013', label: 'Office'
    }],
    shippingAddresses: [],
    contacts: [{
      id: 'co2', name: 'Nilesh Shah', role: 'Manager',
      phone: '9820098765', email: 'nilesh@shah.in', whatsapp: true
    }],
    outstanding: 320000,
    status: 'Overdue',
    lastTransaction: '2026-03-28',
  },
  {
    id: 'c3',
    code: 'CUST-0003',
    legalName: 'Patel Garments LLP',
    tradeName: 'Patel Garments',
    group: 'Retail',
    phone: '9979123456',
    altPhone: '9979123457',
    email: 'patel@garments.com',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pinCode: '380001',
    gstin: '24AAHCP9012C1Z8',
    pan: 'AAHCP9012C',
    stateCode: '24',
    regType: 'Regular',
    creditLimit: 200000,
    creditPeriod: 15,
    overdueRate: 24,
    priceList: 'Retail B',
    paymentTerms: '15 days',
    broker: 'Suresh Broker',
    billingAddresses: [{
      id: 'ba3', line1: '34, CG Road', line2: 'Navrangpura',
      city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001', label: 'Office'
    }],
    shippingAddresses: [],
    contacts: [{
      id: 'co3', name: 'Kiran Patel', role: 'Owner',
      phone: '9979123456', email: 'kiran@patel.com', whatsapp: false
    }],
    outstanding: 0,
    status: 'Active',
    lastTransaction: '2026-04-18',
  },
  {
    id: 'c4',
    code: 'CUST-0004',
    legalName: 'Desai Exports Pvt Ltd',
    tradeName: 'Desai Exports',
    group: 'Export',
    phone: '9876543210',
    altPhone: '',
    email: 'export@desai.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    pinCode: '302001',
    gstin: '08AAECO3456D1ZQ',
    pan: 'AAECO3456D',
    stateCode: '08',
    regType: 'SEZ',
    creditLimit: 1500000,
    creditPeriod: 60,
    overdueRate: 12,
    priceList: 'Export C',
    paymentTerms: '60 days',
    broker: '',
    billingAddresses: [{
      id: 'ba4', line1: '7, MI Road', line2: '',
      city: 'Jaipur', state: 'Rajasthan', pinCode: '302001', label: 'Office'
    }],
    shippingAddresses: [{
      id: 'sa4', line1: 'SEZ Unit-4', line2: 'Mahindra SEZ',
      city: 'Jaipur', state: 'Rajasthan', pinCode: '302022', label: 'Godown'
    }],
    contacts: [{
      id: 'co4', name: 'Harish Desai', role: 'Director',
      phone: '9876543210', email: 'harish@desai.com', whatsapp: true
    }],
    outstanding: 750000,
    status: 'Active',
    lastTransaction: '2026-04-10',
  },
  {
    id: 'c5',
    code: 'CUST-0005',
    legalName: 'Mehta Trading Co',
    tradeName: 'Mehta Traders',
    group: 'Wholesale',
    phone: '9988776655',
    altPhone: '',
    email: 'mehta@trading.co',
    city: 'Ludhiana',
    state: 'Punjab',
    pinCode: '141001',
    gstin: '03AACCM2345E1Z1',
    pan: 'AACCM2345E',
    stateCode: '03',
    regType: 'Regular',
    creditLimit: 400000,
    creditPeriod: 30,
    overdueRate: 18,
    priceList: 'Wholesale A',
    paymentTerms: '30 days',
    broker: '',
    billingAddresses: [{
      id: 'ba5', line1: 'GT Road, Opp Bus Stand', line2: '',
      city: 'Ludhiana', state: 'Punjab', pinCode: '141001', label: 'Office'
    }],
    shippingAddresses: [],
    contacts: [{
      id: 'co5', name: 'Vishal Mehta', role: 'Partner',
      phone: '9988776655', email: 'vishal@mehta.co', whatsapp: true
    }],
    outstanding: 180000,
    status: 'Active',
    lastTransaction: '2026-04-12',
  },
  {
    id: 'c6',
    code: 'CUST-0006',
    legalName: 'Kumar Sarees',
    tradeName: 'Kumar Sarees',
    group: 'Retail',
    phone: '9876001234',
    altPhone: '',
    email: '',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pinCode: '221001',
    gstin: '09AACKK6789F1Z4',
    pan: 'AACKK6789F',
    stateCode: '09',
    regType: 'Composition',
    creditLimit: 100000,
    creditPeriod: 15,
    overdueRate: 24,
    priceList: 'Retail B',
    paymentTerms: '15 days',
    broker: '',
    billingAddresses: [],
    shippingAddresses: [],
    contacts: [{
      id: 'co6', name: 'Rajiv Kumar', role: 'Owner',
      phone: '9876001234', email: '', whatsapp: false
    }],
    outstanding: 0,
    status: 'Inactive',
    lastTransaction: '2026-02-14',
  },
];

// ─── Mock Products ────────────────────────────────────────────────────────────
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1', code: 'SKU-COT-001', name: 'Pure Cotton Fabric', category: 'Cotton',
    hsn: '5208', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 5.5, currentStock: 2400, lotCount: 4, lowStockThreshold: 500,
    costRate: 85, sellingRate: 120,
  },
  {
    id: 'p2', code: 'SKU-POL-002', name: 'Polyester Georgette', category: 'Polyester',
    hsn: '5407', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 6, currentStock: 1800, lotCount: 3, lowStockThreshold: 400,
    costRate: 55, sellingRate: 80,
  },
  {
    id: 'p3', code: 'SKU-SLK-003', name: 'Pure Silk (Mulberry)', category: 'Silk',
    hsn: '5007', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 6.5, currentStock: 380, lotCount: 2, lowStockThreshold: 200,
    costRate: 450, sellingRate: 680,
  },
  {
    id: 'p4', code: 'SKU-LNN-004', name: 'Linen Shirting', category: 'Linen',
    hsn: '5309', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 5, currentStock: 950, lotCount: 2, lowStockThreshold: 300,
    costRate: 180, sellingRate: 260,
  },
  {
    id: 'p5', code: 'SKU-WOL-005', name: 'Wool Suiting Fabric', category: 'Wool',
    hsn: '5111', gstRate: 12, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 3.5, currentStock: 120, lotCount: 1, lowStockThreshold: 150,
    costRate: 680, sellingRate: 950,
  },
  {
    id: 'p6', code: 'SKU-CHF-006', name: 'Chiffon (Printed)', category: 'Polyester',
    hsn: '5407', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 6, currentStock: 3200, lotCount: 5, lowStockThreshold: 600,
    costRate: 42, sellingRate: 65,
  },
  {
    id: 'p7', code: 'SKU-DEN-007', name: 'Denim Fabric (Blue)', category: 'Denim',
    hsn: '5209', gstRate: 12, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 4, currentStock: 870, lotCount: 3, lowStockThreshold: 300,
    costRate: 135, sellingRate: 200,
  },
  {
    id: 'p8', code: 'SKU-RYN-008', name: 'Rayon Crepe', category: 'Rayon',
    hsn: '5516', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 5.5, currentStock: 2100, lotCount: 4, lowStockThreshold: 500,
    costRate: 65, sellingRate: 95,
  },
  {
    id: 'p9', code: 'SKU-VLV-009', name: 'Velvet (Embossed)', category: 'Velvet',
    hsn: '5801', gstRate: 12, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 5, currentStock: 450, lotCount: 2, lowStockThreshold: 200,
    costRate: 320, sellingRate: 480,
  },
  {
    id: 'p10', code: 'SKU-KHD-010', name: 'Khadi Cotton', category: 'Cotton',
    hsn: '5208', gstRate: 5, primaryUnit: 'Meter', secondaryUnit: 'Piece',
    conversionRatio: 5, currentStock: 680, lotCount: 2, lowStockThreshold: 250,
    costRate: 90, sellingRate: 145,
  },
];

// ─── Mock Lots ────────────────────────────────────────────────────────────────
export const INITIAL_LOTS: Lot[] = [
  {
    id: 'l1', lotNo: 'LOT-2026-001', productId: 'p1', productName: 'Pure Cotton Fabric',
    supplierId: 's1', supplierName: 'Arvind Mills', quantity: 1200,
    costRate: 85, warehouse: 'Main Godown', date: '2026-04-01',
  },
  {
    id: 'l2', lotNo: 'LOT-2026-002', productId: 'p2', productName: 'Polyester Georgette',
    supplierId: 's2', supplierName: 'Reliance Industries', quantity: 900,
    costRate: 55, warehouse: 'Main Godown', date: '2026-04-05',
  },
  {
    id: 'l3', lotNo: 'LOT-2026-003', productId: 'p3', productName: 'Pure Silk (Mulberry)',
    supplierId: 's3', supplierName: 'Karnataka Silk', quantity: 380,
    costRate: 450, warehouse: 'Secure Vault', date: '2026-04-08',
  },
];
