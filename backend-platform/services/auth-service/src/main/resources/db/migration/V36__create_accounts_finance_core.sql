CREATE TABLE IF NOT EXISTS finance_accounts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    account_group VARCHAR(20) NOT NULL CHECK (account_group IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
    account_type VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
    opening_balance_side VARCHAR(6) NOT NULL DEFAULT 'DEBIT' CHECK (opening_balance_side IN ('DEBIT', 'CREDIT')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_parties (
    id BIGSERIAL PRIMARY KEY,
    party_type VARCHAR(12) NOT NULL CHECK (party_type IN ('CUSTOMER', 'VENDOR')),
    name VARCHAR(180) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    email VARCHAR(254),
    phone VARCHAR(40),
    address TEXT,
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
    opening_balance_side VARCHAR(6) NOT NULL DEFAULT 'DEBIT' CHECK (opening_balance_side IN ('DEBIT', 'CREDIT')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_finance_parties_type_name ON finance_parties(party_type, name);
CREATE INDEX IF NOT EXISTS idx_finance_parties_gstin ON finance_parties(gstin) WHERE gstin IS NOT NULL;

CREATE TABLE IF NOT EXISTS finance_tax_codes (
    id BIGSERIAL PRIMARY KEY,
    tax_type VARCHAR(8) NOT NULL CHECK (tax_type IN ('GST', 'TDS')),
    code VARCHAR(40) NOT NULL,
    description VARCHAR(180) NOT NULL,
    rate NUMERIC(7, 4) NOT NULL CHECK (rate >= 0 AND rate <= 100),
    component VARCHAR(12) NOT NULL DEFAULT 'TOTAL' CHECK (component IN ('TOTAL', 'CGST', 'SGST', 'IGST', 'TDS')),
    effective_from DATE,
    effective_to DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tax_type, code, component, effective_from)
);

CREATE TABLE IF NOT EXISTS finance_bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE REFERENCES finance_accounts(id),
    bank_name VARCHAR(160) NOT NULL,
    account_holder VARCHAR(180),
    account_number VARCHAR(80),
    ifsc VARCHAR(11),
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_vouchers (
    id BIGSERIAL PRIMARY KEY,
    voucher_number VARCHAR(40) NOT NULL UNIQUE,
    voucher_type VARCHAR(32) NOT NULL,
    voucher_date DATE NOT NULL,
    party_id BIGINT REFERENCES finance_parties(id),
    reference_number VARCHAR(80),
    narration TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOID')),
    accounting_basis VARCHAR(8) NOT NULL DEFAULT 'ACCRUAL' CHECK (accounting_basis IN ('CASH', 'ACCRUAL')),
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS finance_voucher_number_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_finance_vouchers_date_type ON finance_vouchers(voucher_date, voucher_type);
CREATE INDEX IF NOT EXISTS idx_finance_vouchers_party ON finance_vouchers(party_id, voucher_date);
CREATE INDEX IF NOT EXISTS idx_finance_vouchers_status ON finance_vouchers(status, voucher_date);

CREATE TABLE IF NOT EXISTS finance_voucher_lines (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT NOT NULL REFERENCES finance_vouchers(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id BIGINT NOT NULL REFERENCES finance_accounts(id),
    description VARCHAR(240),
    debit NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    tax_code_id BIGINT REFERENCES finance_tax_codes(id),
    reconciled_at TIMESTAMP,
    reconciliation_reference VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (voucher_id, line_number),
    CHECK (NOT (debit > 0 AND credit > 0)),
    CHECK (debit > 0 OR credit > 0)
);

CREATE INDEX IF NOT EXISTS idx_finance_voucher_lines_account ON finance_voucher_lines(account_id, voucher_id);
CREATE INDEX IF NOT EXISTS idx_finance_voucher_lines_reconciliation ON finance_voucher_lines(account_id, reconciled_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_online_order_reference ON finance_vouchers(reference_number)
    WHERE voucher_type = 'ONLINE_ORDER' AND reference_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS finance_product_mappings (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    sales_account_id BIGINT REFERENCES finance_accounts(id),
    purchase_account_id BIGINT REFERENCES finance_accounts(id),
    inventory_account_id BIGINT REFERENCES finance_accounts(id),
    hsn_sac_code VARCHAR(20),
    tax_code_id BIGINT REFERENCES finance_tax_codes(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_settings (
    id BIGINT PRIMARY KEY CHECK (id = 1),
    accounting_basis VARCHAR(8) NOT NULL DEFAULT 'BOTH' CHECK (accounting_basis IN ('CASH', 'ACCRUAL', 'BOTH')),
    financial_year_start_month SMALLINT NOT NULL DEFAULT 4 CHECK (financial_year_start_month BETWEEN 1 AND 12),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO finance_settings (id, accounting_basis) VALUES (1, 'BOTH') ON CONFLICT (id) DO NOTHING;

INSERT INTO finance_accounts (code, name, account_group, account_type) VALUES
    ('1000', 'Cash in Hand', 'ASSET', 'CASH'),
    ('1100', 'Bank Accounts', 'ASSET', 'BANK'),
    ('1200', 'Trade Receivables', 'ASSET', 'RECEIVABLE'),
    ('1300', 'Inventory', 'ASSET', 'INVENTORY'),
    ('1400', 'Input GST Credit', 'ASSET', 'GST_CREDIT'),
    ('2000', 'Trade Payables', 'LIABILITY', 'PAYABLE'),
    ('2100', 'GST Payable', 'LIABILITY', 'GST_PAYABLE'),
    ('2200', 'TDS Payable', 'LIABILITY', 'TDS_PAYABLE'),
    ('3000', 'Owner Equity', 'EQUITY', 'EQUITY'),
    ('3100', 'Opening Balance Equity', 'EQUITY', 'OPENING_BALANCE'),
    ('4000', 'Sales Revenue', 'INCOME', 'SALES'),
    ('5000', 'Purchases', 'EXPENSE', 'PURCHASE'),
    ('6000', 'Operating Expenses', 'EXPENSE', 'GENERAL')
ON CONFLICT (code) DO NOTHING;