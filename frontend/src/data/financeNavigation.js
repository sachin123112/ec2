const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const financeIcons = {
  'vendor-master': 'vendors',
  'customer-master': 'customers',
  'product-accounting-mapping': 'products',
  'group-ledger': 'reports',
  'bank-accounts': 'accounts',
  'cash-petty-cash': 'income',
  'hsn-sac': 'gst',
  'gst-rates': 'gst',
  'tds-sections-rates': 'tds',
  charges: 'expenses',
  'purchase-order': 'vouchers',
  'goods-receipt-grn': 'orders',
  'purchase-invoice': 'invoices',
  'purchase-voucher': 'vouchers',
  'purchase-return': 'orders',
  'debit-note': 'invoices',
  'online-orders': 'orders',
  'sales-invoice': 'invoices',
  'sales-voucher': 'vouchers',
  'dispatch-outward': 'orders',
  'sales-return': 'orders',
  refund: 'expenses',
  'credit-note': 'invoices',
  'general-payment': 'expenses',
  'vendor-payment': 'vendors',
  'general-receipt': 'income',
  'customer-receipt': 'customers',
  'petty-cash-payment': 'expenses',
  'journal-voucher': 'vouchers',
  'contra-voucher': 'vouchers',
  'expense-voucher': 'expenses',
  'voucher-debit-note': 'invoices',
  'voucher-credit-note': 'invoices',
  'bank-deposit': 'accounts',
  'bank-withdrawal': 'accounts',
  'bank-transfer': 'accounts',
  'payment-gateway-settlement': 'accounts',
  'cod-settlement': 'accounts',
  'bank-reconciliation': 'accounts',
  'input-gst': 'gst',
  'output-gst': 'gst',
  'cgst-sgst-igst': 'gst',
  'hsn-wise-summary': 'reports',
  'gst-reconciliation': 'gst',
  'tds-deduction': 'tds',
  'tds-payable': 'tds',
  'tds-reconciliation': 'tds',
  ledgers: 'reports',
  books: 'reports',
  'purchase-sales': 'reports',
  outstanding: 'reports',
  gst: 'gst',
  tds: 'tds',
  'financial-statements': 'reports',
};

export const financeGroups = [
  { title: 'Overview', items: ['Dashboard'] },
  { title: 'Masters / Creation', items: ['Vendor Master', 'Customer Master', 'Product Accounting Mapping', 'Group & Ledger', 'Bank Accounts', 'Cash / Petty Cash', 'HSN / SAC', 'GST Rates', 'TDS Sections & Rates', 'Charges'] },
  { title: 'Purchase / Inward', items: ['Purchase Order', 'Goods Receipt (GRN)', 'Purchase Invoice', 'Purchase Voucher', 'Purchase Return', 'Debit Note', 'Vendor Outstanding'] },
  { title: 'Sales / Outward', items: ['Online Orders', 'Sales Invoice', 'Sales Voucher', 'Dispatch / Outward', 'Sales Return', 'Refund', 'Credit Note', 'Customer Outstanding'] },
  { title: 'Vouchers', items: ['General Payment', 'Vendor Payment', 'General Receipt', 'Customer Receipt', 'Petty Cash Payment', 'Journal Voucher', 'Contra Voucher', 'Expense Voucher', 'Voucher Debit Note', 'Voucher Credit Note'] },
  { title: 'Banking', items: ['Bank Deposit', 'Bank Withdrawal', 'Bank Transfer', 'Payment Gateway Settlement', 'COD Settlement', 'Bank Reconciliation'] },
  { title: 'GST & TDS', items: ['Input GST', 'Output GST', 'CGST / SGST / IGST', 'HSN-wise Summary', 'GST Reconciliation', 'TDS Deduction', 'TDS Payable', 'TDS Reconciliation'] },
  { title: 'Ledgers', items: ['Vendor Ledger', 'Customer Ledger', 'Product Ledger', 'Purchase Ledger', 'Sales Ledger', 'Expense Ledger', 'Cash Ledger', 'Bank Ledger'] },
  { title: 'Reports', items: ['Ledgers', 'Books', 'Purchase & Sales', 'Outstanding', 'GST', 'TDS', 'Financial Statements'] },
].map(group => ({
  ...group,
  items: group.items.map(title => {
    const key = title === 'Dashboard' ? 'dashboard' : slug(title);
    return { title, key, icon: financeIcons[key] || 'reports' };
  }),
}));

const financeItems = new Map(financeGroups.flatMap(group => group.items).map(item => [item.key, item]));
const selectFinanceItems = (keys, titleOverrides = {}) => keys.map(key => ({
  ...financeItems.get(key),
  title: titleOverrides[key] || financeItems.get(key).title,
}));

export const financeSidebarSections = [
  {
    title: 'Creation',
    groups: [{
      title: 'Creation',
      items: selectFinanceItems([
        'vendor-master', 'group-ledger', 'bank-accounts', 'cash-petty-cash',
        'hsn-sac', 'gst-rates', 'tds-sections-rates', 'charges',
      ]),
    }],
  },
  {
    title: 'Transaction',
    groups: [
      { title: 'Purchase', items: selectFinanceItems(['purchase-invoice', 'goods-receipt-grn', 'purchase-return', 'debit-note'], { 'goods-receipt-grn': 'Goods Receipt' }) },
      { title: 'Sales', items: selectFinanceItems(['sales-invoice', 'sales-return', 'refund', 'credit-note']) },
      { title: 'Vouchers', items: selectFinanceItems(['general-payment', 'vendor-payment', 'general-receipt', 'customer-receipt', 'petty-cash-payment', 'journal-voucher', 'contra-voucher', 'expense-voucher']) },
      { title: 'Banking', items: selectFinanceItems(['bank-deposit', 'bank-withdrawal', 'bank-transfer', 'payment-gateway-settlement', 'cod-settlement', 'bank-reconciliation']) },
    ],
  },
  {
    title: 'Reports',
    columns: true,
    groups: [{
      title: 'Reports',
      items: [
        { title: 'Ledgers', key: 'ledgers', icon: 'reports' },
        { title: 'Books', key: 'books', icon: 'reports' },
        { title: 'Purchase & Sales', key: 'purchase-sales', icon: 'reports' },
        { title: 'Outstanding', key: 'outstanding', icon: 'reports' },
        { title: 'GST', key: 'gst', icon: 'gst' },
        { title: 'TDS', key: 'tds', icon: 'tds' },
        { title: 'Financial Statements', key: 'financial-statements', icon: 'reports' },
      ],
    }],
  },
];

export const financeReportTypes = {
  ledgers: 'ledgers',
  books: 'books',
  'purchase-sales': 'purchase-sales',
  outstanding: 'outstanding',
  gst: 'gst',
  tds: 'tds',
  'financial-statements': 'financial-statements',
};