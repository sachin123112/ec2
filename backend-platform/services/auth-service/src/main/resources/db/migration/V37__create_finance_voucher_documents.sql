CREATE TABLE IF NOT EXISTS finance_voucher_documents (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT NOT NULL REFERENCES finance_vouchers(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size >= 0 AND file_size <= 10485760),
    content BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_finance_voucher_documents_voucher
    ON finance_voucher_documents(voucher_id, id);
