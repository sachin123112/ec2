import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { financeGroups, financeReportTypes } from '../data/financeNavigation';
import './AccountsFinance.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const formatMoney = value => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const financeReportColumns = {
  ledgers: [['code', 'Code'], ['name', 'Account'], ['accountGroup', 'Group'], ['debit', 'Debit'], ['credit', 'Credit']],
  books: [['voucherNumber', 'Voucher'], ['voucherDate', 'Date'], ['voucherType', 'Type'], ['partyName', 'Party'], ['totalAmount', 'Amount'], ['status', 'Status']],
  'purchase-sales': [['voucherNumber', 'Voucher'], ['voucherDate', 'Date'], ['voucherType', 'Type'], ['partyName', 'Party'], ['totalAmount', 'Amount'], ['status', 'Status']],
  outstanding: [['name', 'Party'], ['partyType', 'Type'], ['gstin', 'GSTIN'], ['outstandingBalance', 'Outstanding']],
  gst: [['code', 'Code'], ['description', 'Description'], ['rate', 'Rate %'], ['component', 'Component'], ['postedVoucherCount', 'Vouchers'], ['postedAmount', 'Posted amount']],
  tds: [['code', 'Section'], ['description', 'Description'], ['rate', 'Rate %'], ['component', 'Component'], ['postedVoucherCount', 'Vouchers'], ['postedAmount', 'Posted amount']],
  'financial-statements': [['code', 'Code'], ['name', 'Account'], ['accountGroup', 'Group'], ['debit', 'Debit'], ['credit', 'Credit']],
};
const voucherTypes = {
  'purchase-order': 'PURCHASE_ORDER', 'goods-receipt-grn': 'GRN', 'purchase-invoice': 'PURCHASE_INVOICE',
  'purchase-voucher': 'PURCHASE_VOUCHER', 'purchase-return': 'PURCHASE_RETURN', 'debit-note': 'DEBIT_NOTE',
  'online-orders': 'ONLINE_ORDER', 'sales-invoice': 'SALES_INVOICE', 'sales-voucher': 'SALES_VOUCHER',
  'dispatch-outward': 'DISPATCH', 'sales-return': 'SALES_RETURN', refund: 'REFUND', 'credit-note': 'CREDIT_NOTE',
  'general-payment': 'GENERAL_PAYMENT', 'vendor-payment': 'VENDOR_PAYMENT', 'general-receipt': 'GENERAL_RECEIPT',
  'customer-receipt': 'CUSTOMER_RECEIPT', 'petty-cash-payment': 'PETTY_CASH_PAYMENT', 'journal-voucher': 'JOURNAL',
  'contra-voucher': 'CONTRA', 'expense-voucher': 'EXPENSE', 'voucher-debit-note': 'DEBIT_NOTE',
  'voucher-credit-note': 'CREDIT_NOTE', 'bank-deposit': 'BANK_DEPOSIT', 'bank-withdrawal': 'BANK_WITHDRAWAL',
  'bank-transfer': 'BANK_TRANSFER', 'payment-gateway-settlement': 'GATEWAY_SETTLEMENT', 'cod-settlement': 'COD_SETTLEMENT',
  'input-gst': 'JOURNAL', 'output-gst': 'JOURNAL', 'cgst-sgst-igst': 'JOURNAL',
  'tds-deduction': 'GENERAL_PAYMENT', 'tds-payable': 'GENERAL_PAYMENT',
};

const blankLine = () => ({ accountId: '', description: '', debit: '', credit: '' });

async function financeRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}/admin/finance${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 404) throw new Error('Finance API is not active yet. Restart the auth service to apply the finance migration and endpoints.');
    throw new Error(body?.message || `Finance request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export default function AccountsFinance() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleKey = searchParams.get('module') || 'dashboard';
  const selectedItem = financeGroups.flatMap(group => group.items).find(item => item.key === moduleKey) || financeGroups[0].items[0];
  const [dashboard, setDashboard] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [parties, setParties] = useState([]);
  const [taxCodes, setTaxCodes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [productMappings, setProductMappings] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [reconciliationLines, setReconciliationLines] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ accountingBasis: 'ACCRUAL', currencyCode: 'INR' });
  const [reportBasis, setReportBasis] = useState('ACCRUAL');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({});
  const [voucherLines, setVoucherLines] = useState([blankLine(), blankLine()]);
  const [ledgerAccountId, setLedgerAccountId] = useState('');
  const [ledger, setLedger] = useState(null);
  const reportType = financeReportTypes[moduleKey];

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [summary, accountRows, partyRows, taxRows, bankRows, mappingRows, voucherRows, reconciliationRows, trialBalanceRows, productResponse, settingsRow, reportResponse] = await Promise.all([
        financeRequest(`/dashboard?basis=${reportBasis}`, token),
        financeRequest('/accounts', token),
        financeRequest('/parties', token),
        financeRequest('/tax-codes', token),
        financeRequest('/bank-accounts', token),
        financeRequest('/product-mappings', token),
        financeRequest('/vouchers', token),
        financeRequest('/reconciliation', token),
        financeRequest(`/trial-balance?basis=${reportBasis}`, token),
        fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }).then(response => response.ok ? response.json() : []),
        financeRequest('/settings', token),
        reportType ? financeRequest(`/reports/${reportType}?basis=${reportBasis}`, token) : Promise.resolve(null),
      ]);
      setDashboard(summary);
      setReportData(reportResponse);
      setAccounts(accountRows);
      setParties(partyRows);
      setTaxCodes(taxRows);
      setBankAccounts(bankRows);
      setProductMappings(mappingRows);
      setVouchers(voucherRows);
      setReconciliationLines(reconciliationRows);
      setTrialBalance(trialBalanceRows);
      setProducts(Array.isArray(productResponse) ? productResponse : []);
      setSettings(settingsRow);
      setLedgerAccountId(current => current || String(accountRows[0]?.id || ''));
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'Unable to load finance records. Apply database migrations and restart the auth service.');
    }
  }, [token, reportBasis, reportType]);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleVouchers = useMemo(() => {
    const type = voucherTypes[moduleKey];
    if (type) return vouchers.filter(voucher => voucher.voucherType === type);
    if (moduleKey.includes('ledger') || moduleKey.endsWith('register') || moduleKey.endsWith('report') || moduleKey.includes('outstanding') || moduleKey.includes('reconciliation')) {
      return vouchers.filter(voucher => voucher.status === 'POSTED');
    }
    return vouchers;
  }, [moduleKey, vouchers]);

  function setValue(name, value) {
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      if (moduleKey === 'vendor-master' || moduleKey === 'customer-master') {
        await financeRequest('/parties', token, { method: 'POST', body: JSON.stringify({ ...form, partyType: moduleKey === 'vendor-master' ? 'VENDOR' : 'CUSTOMER' }) });
      } else if (moduleKey === 'group-ledger' || moduleKey === 'cash-petty-cash' || moduleKey === 'charges') {
        await financeRequest('/accounts', token, { method: 'POST', body: JSON.stringify(form) });
      } else if (moduleKey === 'bank-accounts') {
        await financeRequest('/bank-accounts', token, { method: 'POST', body: JSON.stringify(form) });
      } else if (moduleKey === 'gst-rates' || moduleKey === 'tds-sections-rates') {
        await financeRequest('/tax-codes', token, { method: 'POST', body: JSON.stringify({ ...form, taxType: moduleKey === 'gst-rates' ? 'GST' : 'TDS' }) });
      } else if (moduleKey === 'hsn-sac') {
          const { productId, ...mappingInput } = form;
          await financeRequest(`/product-mappings/${productId}`, token, { method: 'PUT', body: JSON.stringify(mappingInput) });
      } else if (voucherTypes[moduleKey]) {
        await financeRequest('/vouchers', token, { method: 'POST', body: JSON.stringify({
          voucherType: voucherTypes[moduleKey],
          voucherDate: form.voucherDate || new Date().toISOString().slice(0, 10),
          partyId: form.partyId || null,
          referenceNumber: form.referenceNumber || '',
          narration: form.narration || selectedItem.title,
          status: form.status || 'DRAFT',
          accountingBasis: form.accountingBasis || (settings.accountingBasis === 'CASH' ? 'CASH' : 'ACCRUAL'),
          lines: voucherLines.map(line => ({ ...line, accountId: Number(line.accountId), taxCodeId: line.taxCodeId ? Number(line.taxCodeId) : null, debit: Number(line.debit || 0), credit: Number(line.credit || 0) })),
        }) });
      } else {
        setStatus('This workspace is read-only until its transaction workflow is configured.');
        return;
      }
      setForm({});
      setVoucherLines([blankLine(), blankLine()]);
      setStatus(`${selectedItem.title} saved.`);
      await loadData();
    } catch (error) {
      setStatus(error.message || 'Unable to save this finance record.');
    } finally {
      setBusy(false);
    }
  }

  async function loadLedger() {
    if (!ledgerAccountId) return;
    try {
      setLedger(await financeRequest(`/ledger/${ledgerAccountId}`, token));
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'Unable to load this ledger.');
    }
  }

  async function markReconciled(lineId, reference) {
    try {
      await financeRequest(`/reconciliation/${lineId}`, token, { method: 'PUT', body: JSON.stringify({ reference }) });
      setStatus('Bank transaction reconciled.');
      await loadData();
    } catch (error) {
      setStatus(error.message || 'Unable to reconcile this transaction.');
    }
  }

  function updateVoucherLine(index, field, value) {
    setVoucherLines(current => current.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line));
  }

  const isDashboard = moduleKey === 'dashboard';
  const isPartyMaster = moduleKey === 'vendor-master' || moduleKey === 'customer-master';
  const isAccountMaster = moduleKey === 'group-ledger' || moduleKey === 'cash-petty-cash' || moduleKey === 'charges';
  const isTaxMaster = moduleKey === 'gst-rates' || moduleKey === 'tds-sections-rates';
  const isVoucher = Boolean(voucherTypes[moduleKey]);
  const isReport = financeGroups.find(group => group.title === 'Reports')?.items.some(item => item.key === moduleKey);
  const isLedger = !isReport && (moduleKey.includes('ledger') || moduleKey === 'cash-in-hand' || moduleKey === 'petty-cash' || moduleKey === 'bank-book');

  return (
    <div className="finance-page">
      <header className="finance-header">
        <div>
          <div className="finance-breadcrumb"><Link to="/admin/dashboard">Dashboard</Link><span>›</span><span>Accounts &amp; Finance</span></div>
          <p className="finance-eyebrow">FINANCE WORKSPACE</p>
          <h1>{isDashboard ? 'Accounts & Finance' : selectedItem.title}</h1>
          <p className="finance-header-subtitle">Books, balances and statutory reporting</p>
        </div>
        <div className="finance-header-tools">
          <label>Report view
            <select value={reportBasis} onChange={event => setReportBasis(event.target.value)}>
              <option value="ACCRUAL">Accrual basis</option><option value="CASH">Cash basis</option>
            </select>
          </label>
          <button type="button" className="finance-refresh" onClick={loadData} title="Refresh finance data" aria-label="Refresh finance data">↻</button>
        </div>
      </header>

      {status && <div className="finance-status" role="status">{status}</div>}

      <div className="finance-layout">
        <main className="finance-content">
          {isDashboard ? (
            <>
              <div className="finance-kpi-grid">
                {[
                  ['Total Sales', dashboard?.totalSales, 'Posted income in this period', 'sales'],
                  ['Total Purchases', dashboard?.totalPurchases, 'Posted purchases in this period', 'purchases'],
                  ['Receivables', dashboard?.receivables, 'Open customer balances', 'receivables'],
                  ['Vendor Payables', dashboard?.vendorPayables, 'Open vendor balances', 'payables'],
                ].map(([title, amount, detail, accent]) => (
                  <article className={`finance-kpi finance-kpi-${accent}`} key={title}>
                    <span>{title}</span><strong>{formatMoney(amount)}</strong><small>{detail}</small>
                  </article>
                ))}
              </div>
              <div className="finance-dashboard-overview">
                <section className="finance-panel finance-comparison-panel">
                  <div className="finance-panel-heading"><div><p className="finance-eyebrow">SELECTED PERIOD</p><h2>Sales &amp; purchase overview</h2></div><span>{dashboard?.accountingBasis || reportBasis} basis</span></div>
                  <div className="finance-comparison-bars" role="img" aria-label={`Sales ${formatMoney(dashboard?.totalSales)}; purchases ${formatMoney(dashboard?.totalPurchases)}`}>
                    {[
                      ['Sales', dashboard?.totalSales, 'sales'],
                      ['Purchases', dashboard?.totalPurchases, 'purchases'],
                    ].map(([label, amount, tone]) => {
                      const value = Number(amount || 0);
                      const maximum = Math.max(Number(dashboard?.totalSales || 0), Number(dashboard?.totalPurchases || 0), 1);
                      return <div className="finance-comparison-row" key={label}>
                        <span>{label}</span><div className="finance-comparison-track"><i className={`finance-comparison-fill finance-comparison-fill-${tone}`} style={{ width: `${Math.max(value / maximum * 100, value > 0 ? 2 : 0)}%` }} /></div><strong>{formatMoney(value)}</strong>
                      </div>;
                    })}
                  </div>
                  <div className="finance-comparison-legend"><span className="finance-legend-sales">Sales</span><span className="finance-legend-purchases">Purchases</span></div>
                </section>
                <div className="finance-dashboard-summary">
                  <section className="finance-panel finance-profit-panel">
                    <div className="finance-panel-heading"><div><p className="finance-eyebrow">CURRENT POSITION</p><h2>Profit &amp; Loss</h2></div></div>
                    <strong className={Number(dashboard?.profitLoss || 0) < 0 ? 'is-negative' : ''}>{formatMoney(dashboard?.profitLoss)}</strong>
                    <p>Sales less posted expenses</p>
                    <dl><div><dt>Sales</dt><dd>{formatMoney(dashboard?.totalSales)}</dd></div><div><dt>Purchases</dt><dd>{formatMoney(dashboard?.totalPurchases)}</dd></div></dl>
                  </section>
                  <section className="finance-panel finance-tax-panel">
                    <div className="finance-panel-heading"><div><p className="finance-eyebrow">TAX POSITION</p><h2>GST &amp; TDS</h2></div></div>
                    <dl><div><dt>GST payable</dt><dd>{formatMoney(dashboard?.gstPayable)}</dd></div><div><dt>TDS payable</dt><dd>{formatMoney(dashboard?.tdsPayable)}</dd></div></dl>
                  </section>
                </div>
              </div>
              <div className="finance-dashboard-lower">
                <section className="finance-panel finance-transactions-panel">
                  <div className="finance-panel-heading"><div><p className="finance-eyebrow">ACCOUNTING ACTIVITY</p><h2>Recent transactions</h2></div><span>{dashboard?.postedVouchers || 0} posted · {dashboard?.draftVouchers || 0} drafts</span></div>
                  <VoucherTable vouchers={vouchers.slice(0, 8)} />
                </section>
                <section className="finance-panel finance-quick-panel">
                  <div className="finance-panel-heading"><div><p className="finance-eyebrow">SHORTCUTS</p><h2>Quick actions</h2></div></div>
                  <div className="finance-quick-actions">
                    <button type="button" onClick={() => setSearchParams({ module: 'vendor-master' })}>Add vendor</button>
                    <button type="button" onClick={() => setSearchParams({ module: 'purchase-invoice' })}>Purchase invoice</button>
                    <button type="button" onClick={() => setSearchParams({ module: 'sales-invoice' })}>Sales invoice</button>
                    <button type="button" onClick={() => setSearchParams({ module: 'journal-voucher' })}>Journal voucher</button>
                    <button type="button" onClick={() => setSearchParams({ module: 'gst-rates' })}>GST rates</button>
                    <button type="button" onClick={() => setSearchParams({ module: 'bank-reconciliation' })}>Bank reconciliation</button>
                  </div>
                  <div className="finance-quick-meta"><span>Accounts <strong>{accounts.length}</strong></span><span>Parties <strong>{parties.length}</strong></span><span>Tax codes <strong>{taxCodes.length}</strong></span></div>
                </section>
              </div>
            </>
          ) : (
            <ModuleWorkspace
              title={selectedItem.title}
              moduleKey={moduleKey}
              accounts={accounts}
              parties={parties}
              taxCodes={taxCodes}
              bankAccounts={bankAccounts}
              mappings={productMappings}
              products={products}
              vouchers={visibleVouchers}
              form={form}
              setValue={setValue}
              voucherLines={voucherLines}
              updateVoucherLine={updateVoucherLine}
              addVoucherLine={() => setVoucherLines(lines => [...lines, blankLine()])}
              removeVoucherLine={index => setVoucherLines(lines => lines.filter((_, lineIndex) => lineIndex !== index))}
              onSubmit={handleSubmit}
              busy={busy}
              settings={settings}
              isPartyMaster={isPartyMaster}
              isAccountMaster={isAccountMaster}
              isTaxMaster={isTaxMaster}
              isVoucher={isVoucher}
              isLedger={isLedger}
              isReport={isReport}
              ledgerAccountId={ledgerAccountId}
              setLedgerAccountId={setLedgerAccountId}
              ledger={ledger}
              loadLedger={loadLedger}
              reconciliationLines={reconciliationLines}
              onReconcile={markReconciled}
              trialBalance={trialBalance}
              reportData={reportData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ModuleWorkspace({ title, moduleKey, accounts, parties, taxCodes, bankAccounts, mappings, products, vouchers, form, setValue, voucherLines, updateVoucherLine, addVoucherLine, removeVoucherLine, onSubmit, busy, settings, isPartyMaster, isAccountMaster, isTaxMaster, isVoucher, isLedger, isReport, ledgerAccountId, setLedgerAccountId, ledger, loadLedger, reconciliationLines, onReconcile, trialBalance, reportData }) {
  const partyType = moduleKey === 'vendor-master' ? 'VENDOR' : 'CUSTOMER';
  const partyRows = parties.filter(party => party.partyType === partyType);
  const accountRows = moduleKey === 'cash-petty-cash' ? accounts.filter(account => account.accountType === 'CASH') : moduleKey === 'charges' ? accounts.filter(account => account.accountGroup === 'EXPENSE') : accounts;
  const taxType = moduleKey === 'tds-sections-rates' ? 'TDS' : 'GST';
  const isTaxList = !isReport && ['gst-report', 'tds-report', 'input-gst', 'output-gst', 'cgst-sgst-igst', 'tds-deduction', 'tds-payable', 'hsn-wise-summary', 'gst-reconciliation', 'tds-reconciliation'].includes(moduleKey);
  const isProductMapping = moduleKey === 'product-accounting-mapping' || moduleKey === 'hsn-sac';
  const isBank = moduleKey === 'bank-accounts';
  const isPartyLedger = !isReport && (moduleKey === 'vendor-ledger' || moduleKey === 'customer-ledger' || moduleKey.includes('outstanding') || moduleKey === 'vendor-statement');
  const isReconciliation = !isReport && moduleKey === 'bank-reconciliation';
  const isTrialBalance = !isReport && moduleKey === 'trial-balance';
  const openingDebit = voucherLines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const openingCredit = voucherLines.reduce((sum, line) => sum + Number(line.credit || 0), 0);

  return (
    <>
      <section className="finance-panel finance-module-intro">
        <div><p className="finance-eyebrow">{financeGroups.find(group => group.items.some(item => item.key === moduleKey))?.title || 'FINANCE'}</p><h2>{title}</h2><p>{moduleDescriptions[moduleKey] || 'Review posted accounting activity, balances and related records.'}</p></div>
        <span className="finance-module-count">{isPartyMaster ? partyRows.length : isAccountMaster ? accountRows.length : vouchers.length} records</span>
      </section>

      {(isPartyMaster || isAccountMaster || isTaxMaster || isBank || isProductMapping || isVoucher) && (
        <form className="finance-panel finance-entry-form" onSubmit={onSubmit}>
          <div className="finance-panel-heading"><div><p className="finance-eyebrow">NEW RECORD</p><h2>{isVoucher ? 'Create voucher' : `Add ${isPartyMaster ? partyType.toLowerCase() : isAccountMaster ? 'ledger account' : isTaxMaster ? 'tax code' : isBank ? 'bank account' : 'product mapping'}`}</h2></div></div>
          {isPartyMaster && <div className="finance-form-grid">
            <Field label="Name" required><input required value={form.name || ''} onChange={event => setValue('name', event.target.value)} placeholder={partyType === 'VENDOR' ? 'Vendor legal name' : 'Customer name'} /></Field>
            <Field label="GSTIN"><input value={form.gstin || ''} onChange={event => setValue('gstin', event.target.value.toUpperCase())} maxLength="15" /></Field>
            <Field label="PAN"><input value={form.pan || ''} onChange={event => setValue('pan', event.target.value.toUpperCase())} maxLength="10" /></Field>
            <Field label="Email"><input type="email" value={form.email || ''} onChange={event => setValue('email', event.target.value)} /></Field>
            <Field label="Phone"><input value={form.phone || ''} onChange={event => setValue('phone', event.target.value)} /></Field>
            <Field label="Opening balance"><input type="number" min="0" step="0.01" value={form.openingBalance || ''} onChange={event => setValue('openingBalance', event.target.value)} /></Field>
            <Field label="Balance side"><select value={form.openingBalanceSide || 'DEBIT'} onChange={event => setValue('openingBalanceSide', event.target.value)}><option value="DEBIT">Debit</option><option value="CREDIT">Credit</option></select></Field>
            <Field label="Address" className="finance-field-wide"><textarea rows="2" value={form.address || ''} onChange={event => setValue('address', event.target.value)} /></Field>
          </div>}
          {isAccountMaster && <div className="finance-form-grid">
            <Field label="Account code" required><input required value={form.code || ''} onChange={event => setValue('code', event.target.value)} /></Field>
            <Field label="Account name" required><input required value={form.name || ''} onChange={event => setValue('name', event.target.value)} /></Field>
            <Field label="Group"><select value={form.accountGroup || (moduleKey === 'charges' ? 'EXPENSE' : 'ASSET')} onChange={event => setValue('accountGroup', event.target.value)}>{['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(option => <option key={option}>{option}</option>)}</select></Field>
            <Field label="Account type"><select value={form.accountType || 'GENERAL'} onChange={event => setValue('accountType', event.target.value)}>{['GENERAL', 'CASH', 'BANK', 'RECEIVABLE', 'PAYABLE', 'INVENTORY', 'GST_CREDIT', 'GST_PAYABLE', 'TDS_PAYABLE', 'SALES', 'PURCHASE'].map(option => <option key={option}>{option}</option>)}</select></Field>
            <Field label="Opening balance"><input type="number" min="0" step="0.01" value={form.openingBalance || ''} onChange={event => setValue('openingBalance', event.target.value)} /></Field>
            <Field label="Balance side"><select value={form.openingBalanceSide || 'DEBIT'} onChange={event => setValue('openingBalanceSide', event.target.value)}><option>DEBIT</option><option>CREDIT</option></select></Field>
          </div>}
          {isTaxMaster && <div className="finance-form-grid">
            <Field label={taxType === 'GST' ? 'GST / HSN-SAC code' : 'TDS section'} required><input required value={form.code || ''} onChange={event => setValue('code', event.target.value.toUpperCase())} placeholder={taxType === 'GST' ? 'Use approved code' : 'Use approved section'} /></Field>
            <Field label="Description" required><input required value={form.description || ''} onChange={event => setValue('description', event.target.value)} /></Field>
            <Field label="Rate (%)" required><input required type="number" min="0" max="100" step="0.0001" value={form.rate || ''} onChange={event => setValue('rate', event.target.value)} /></Field>
            <Field label="Component"><select value={form.component || 'TOTAL'} onChange={event => setValue('component', event.target.value)}>{(taxType === 'GST' ? ['TOTAL', 'CGST', 'SGST', 'IGST'] : ['TDS']).map(option => <option key={option}>{option}</option>)}</select></Field>
            <Field label="Effective from"><input type="date" value={form.effectiveFrom || ''} onChange={event => setValue('effectiveFrom', event.target.value)} /></Field>
            <Field label="Effective to"><input type="date" value={form.effectiveTo || ''} onChange={event => setValue('effectiveTo', event.target.value)} /></Field>
          </div>}
          {isBank && <div className="finance-form-grid">
            <Field label="Ledger account" required><select required value={form.accountId || ''} onChange={event => setValue('accountId', event.target.value)}><option value="">Select bank ledger</option>{accounts.filter(account => account.accountType === 'BANK').map(account => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select></Field>
            <Field label="Bank name" required><input required value={form.bankName || ''} onChange={event => setValue('bankName', event.target.value)} /></Field>
            <Field label="Account holder"><input value={form.accountHolder || ''} onChange={event => setValue('accountHolder', event.target.value)} /></Field>
            <Field label="Account number"><input value={form.accountNumber || ''} onChange={event => setValue('accountNumber', event.target.value)} /></Field>
            <Field label="IFSC"><input value={form.ifsc || ''} onChange={event => setValue('ifsc', event.target.value.toUpperCase())} maxLength="11" /></Field>
            <Field label="Opening balance"><input type="number" min="0" step="0.01" value={form.openingBalance || ''} onChange={event => setValue('openingBalance', event.target.value)} /></Field>
          </div>}
          {isProductMapping && <div className="finance-form-grid">
            <Field label="Product" required><select required value={form.productId || ''} onChange={event => setValue('productId', event.target.value)}><option value="">Select product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
            <Field label="HSN / SAC"><input value={form.hsnSacCode || ''} onChange={event => setValue('hsnSacCode', event.target.value)} /></Field>
            <Field label="Sales account"><AccountSelect accounts={accounts} value={form.salesAccountId || ''} onChange={value => setValue('salesAccountId', value)} /></Field>
            <Field label="Purchase account"><AccountSelect accounts={accounts} value={form.purchaseAccountId || ''} onChange={value => setValue('purchaseAccountId', value)} /></Field>
            <Field label="Inventory account"><AccountSelect accounts={accounts} value={form.inventoryAccountId || ''} onChange={value => setValue('inventoryAccountId', value)} /></Field>
            <Field label="Tax code"><select value={form.taxCodeId || ''} onChange={event => setValue('taxCodeId', event.target.value)}><option value="">No tax code</option>{taxCodes.map(tax => <option value={tax.id} key={tax.id}>{tax.code} · {tax.rate}%</option>)}</select></Field>
          </div>}
          {isVoucher && <>
            <div className="finance-form-grid">
              <Field label="Voucher date"><input type="date" value={form.voucherDate || new Date().toISOString().slice(0, 10)} onChange={event => setValue('voucherDate', event.target.value)} /></Field>
              <Field label="Party"><select value={form.partyId || ''} onChange={event => setValue('partyId', event.target.value)}><option value="">No party</option>{parties.map(party => <option value={party.id} key={party.id}>{party.partyType}: {party.name}</option>)}</select></Field>
              <Field label="Reference"><input value={form.referenceNumber || ''} onChange={event => setValue('referenceNumber', event.target.value)} /></Field>
              <Field label="Basis"><select value={form.accountingBasis || (settings.accountingBasis === 'CASH' ? 'CASH' : 'ACCRUAL')} onChange={event => setValue('accountingBasis', event.target.value)}><option value="ACCRUAL">Accrual</option><option value="CASH">Cash</option></select></Field>
              <Field label="Status"><select value={form.status || 'DRAFT'} onChange={event => setValue('status', event.target.value)}><option value="DRAFT">Save as draft</option><option value="POSTED">Post to ledger</option></select></Field>
              <Field label="Narration" className="finance-field-wide"><input value={form.narration || ''} onChange={event => setValue('narration', event.target.value)} /></Field>
            </div>
            <div className="finance-lines-heading"><h3>Voucher lines</h3><span>Debits {formatMoney(openingDebit)} · Credits {formatMoney(openingCredit)}</span></div>
            <div className="finance-voucher-lines">
              {voucherLines.map((line, index) => <div className="finance-voucher-line" key={index}>
                <select aria-label={`Account for line ${index + 1}`} required value={line.accountId} onChange={event => updateVoucherLine(index, 'accountId', event.target.value)}><option value="">Select account</option>{accounts.filter(account => account.active).map(account => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}</select>
                <input aria-label={`Line ${index + 1} description`} value={line.description} onChange={event => updateVoucherLine(index, 'description', event.target.value)} placeholder="Line description" />
                <select aria-label={`Tax code for line ${index + 1}`} value={line.taxCodeId || ''} onChange={event => updateVoucherLine(index, 'taxCodeId', event.target.value)}><option value="">No tax code</option>{taxCodes.map(tax => <option key={tax.id} value={tax.id}>{tax.code} · {tax.rate}%</option>)}</select>
                <input aria-label={`Line ${index + 1} debit`} type="number" min="0" step="0.01" value={line.debit} onChange={event => updateVoucherLine(index, 'debit', event.target.value)} placeholder="Debit" />
                <input aria-label={`Line ${index + 1} credit`} type="number" min="0" step="0.01" value={line.credit} onChange={event => updateVoucherLine(index, 'credit', event.target.value)} placeholder="Credit" />
                <button type="button" className="finance-remove-line" aria-label={`Remove line ${index + 1}`} disabled={voucherLines.length <= 2} onClick={() => removeVoucherLine(index)}>×</button>
              </div>)}
            </div>
            <button type="button" className="finance-add-line" onClick={addVoucherLine}>+ Add line</button>
          </>}
          <button className="finance-submit" type="submit" disabled={busy}>{busy ? 'Saving…' : isVoucher ? 'Save voucher' : 'Save record'}</button>
        </form>
      )}

      {(isPartyMaster || isAccountMaster || isTaxMaster || isBank || isProductMapping) && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">REGISTER</p><h2>{title}</h2></div></div>
        {isPartyMaster && <DataTable rows={partyRows} columns={[["name", "Name"], ["gstin", "GSTIN"], ["pan", "PAN"], ["email", "Email"], ["openingBalance", "Opening balance"]]} />}
        {isAccountMaster && <DataTable rows={accountRows} columns={[["code", "Code"], ["name", "Account"], ["accountGroup", "Group"], ["accountType", "Type"], ["openingBalance", "Opening balance"], ["openingBalanceSide", "Side"]]} />}
        {isTaxMaster && <DataTable rows={taxCodes.filter(tax => tax.taxType === taxType)} columns={[["code", "Code / Section"], ["description", "Description"], ["rate", "Rate %"], ["component", "Component"], ["effectiveFrom", "Effective from"], ["effectiveTo", "Effective to"]]} />}
        {isBank && <DataTable rows={bankAccounts} columns={[["bankName", "Bank"], ["accountName", "Ledger account"], ["accountHolder", "Account holder"], ["ifsc", "IFSC"], ["openingBalance", "Opening balance"]]} />}
        {isProductMapping && <DataTable rows={mappings} columns={[["productName", "Product"], ["hsnSacCode", "HSN / SAC"], ["salesAccountId", "Sales account"], ["purchaseAccountId", "Purchase account"], ["taxCodeId", "Tax code"]]} />}
      </section>}

      {isLedger && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">ACCOUNT ACTIVITY</p><h2>{title}</h2></div></div><div className="finance-ledger-controls"><select value={ledgerAccountId} onChange={event => setLedgerAccountId(event.target.value)}><option value="">Select ledger account</option>{accounts.map(account => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select><button type="button" className="finance-submit" onClick={loadLedger}>Load ledger</button></div>{ledger && <><h3 className="finance-ledger-name">{ledger.account.name} · {ledger.account.accountGroup}</h3><DataTable rows={ledger.lines} columns={[["voucherDate", "Date"], ["voucherNumber", "Voucher"], ["voucherType", "Type"], ["description", "Description"], ["debit", "Debit"], ["credit", "Credit"]]} /></>}</section>}

      {isPartyLedger && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">OPEN BALANCES</p><h2>{title}</h2></div></div><DataTable rows={parties.filter(party => moduleKey.startsWith('vendor') ? party.partyType === 'VENDOR' : moduleKey.startsWith('customer') ? party.partyType === 'CUSTOMER' : true)} columns={[["name", "Party"], ["partyType", "Type"], ["gstin", "GSTIN"], ["email", "Email"], ["outstandingBalance", "Outstanding"]]} /></section>}

      {isTaxList && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">CONFIGURED TAX CODES</p><h2>{title}</h2></div></div><DataTable rows={taxCodes.filter(tax => moduleKey.startsWith('tds') ? tax.taxType === 'TDS' : tax.taxType === 'GST')} columns={[["code", "Code / Section"], ["description", "Description"], ["rate", "Rate %"], ["component", "Component"], ["effectiveFrom", "Effective from"], ["effectiveTo", "Effective to"]]} /></section>}

      {isReport && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">FINANCE REPORT</p><h2>{title}</h2></div><span>{reportData ? `${reportData.from} – ${reportData.to}` : 'Loading'}</span></div><DataTable rows={reportData?.rows || []} columns={financeReportColumns[moduleKey] || []} />{reportData?.summary?.balanced !== undefined && <div className="finance-trial-total"><strong>Totals</strong><strong>{formatMoney(reportData.summary.debitTotal)}</strong><strong>{formatMoney(reportData.summary.creditTotal)}</strong></div>}</section>}

      {isTrialBalance && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">AS OF {trialBalance?.to || 'TODAY'}</p><h2>Trial balance</h2></div><span>{trialBalance?.balanced ? 'Balanced' : 'Difference detected'}</span></div><DataTable rows={trialBalance?.rows || []} columns={[["code", "Code"], ["name", "Account"], ["accountGroup", "Group"], ["debit", "Debit"], ["credit", "Credit"]]} /><div className="finance-trial-total"><strong>Totals</strong><strong>{formatMoney(trialBalance?.debitTotal)}</strong><strong>{formatMoney(trialBalance?.creditTotal)}</strong></div></section>}

      {isReconciliation && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">BANK CONTROL</p><h2>Unreconciled bank transactions</h2></div><span>{reconciliationLines.length} open</span></div>{reconciliationLines.length === 0 ? <div className="finance-empty">All posted bank transactions are reconciled.</div> : <div className="finance-table-scroll"><table className="finance-table"><thead><tr><th>Date</th><th>Bank</th><th>Voucher</th><th>Type</th><th>Debit</th><th>Credit</th><th>Statement reference</th><th>Action</th></tr></thead><tbody>{reconciliationLines.map(line => <ReconciliationRow key={line.id} line={line} onReconcile={onReconcile} />)}</tbody></table></div>}</section>}

      {(isVoucher || isPartyLedger) && <section className="finance-panel"><div className="finance-panel-heading"><div><p className="finance-eyebrow">{isVoucher ? 'VOUCHER REGISTER' : 'PARTY ACTIVITY'}</p><h2>{isVoucher ? `${title} register` : `${title} activity`}</h2></div><span>{vouchers.length} vouchers</span></div><VoucherTable vouchers={isPartyLedger ? vouchers.filter(voucher => voucher.partyId) : vouchers} /></section>}
    </>
  );
}

function Field({ label, required, className = '', children }) {
  return <label className={`finance-field ${className}`}>{label}{required && <span className="finance-required"> *</span>}{children}</label>;
}

function AccountSelect({ accounts, value, onChange }) {
  return <select value={value} onChange={event => onChange(event.target.value)}><option value="">No account</option>{accounts.map(account => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select>;
}

function DataTable({ rows, columns }) {
  if (!rows.length) return <div className="finance-empty">No records yet.</div>;
  return <div className="finance-table-scroll"><table className="finance-table"><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || index}>{columns.map(([key]) => <td key={key}>{row[key] ?? '—'}</td>)}</tr>)}</tbody></table></div>;
}

function VoucherTable({ vouchers }) {
  return <DataTable rows={vouchers} columns={[["voucherNumber", "Voucher"], ["voucherDate", "Date"], ["voucherType", "Type"], ["partyName", "Party"], ["narration", "Narration"], ["totalAmount", "Amount"], ["status", "Status"]]} />;
}

function ReconciliationRow({ line, onReconcile }) {
  const [reference, setReference] = useState('');
  return <tr>
    <td>{line.voucherDate}</td><td>{line.accountName}</td><td>{line.voucherNumber}</td><td>{line.voucherType}</td>
    <td>{formatMoney(line.debit)}</td><td>{formatMoney(line.credit)}</td>
    <td><input aria-label={`Statement reference for ${line.voucherNumber}`} value={reference} onChange={event => setReference(event.target.value)} placeholder="Statement reference" /></td>
    <td><button type="button" className="finance-reconcile-button" disabled={!reference.trim()} onClick={() => onReconcile(line.id, reference)}>Reconcile</button></td>
  </tr>;
}

const moduleDescriptions = {
  'vendor-master': 'Maintain vendor identity, tax registration and opening balances.',
  'customer-master': 'Maintain customer identity, tax registration and opening balances.',
  'group-ledger': 'Manage the chart of accounts used by every posted voucher.',
  'gst-rates': 'Enter approved GST rates, components and effective dates. No statutory rate is prefilled.',
  'tds-sections-rates': 'Enter approved TDS sections and rates with their effective dates.',
  'bank-accounts': 'Link bank details to an active BANK ledger for deposits, payments and reconciliation.',
  'product-accounting-mapping': 'Map products to sales, purchase, inventory and tax ledgers.',
};