ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(20),
    ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(80),
    ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_gateway_order_id
    ON payments (gateway_order_id)
    WHERE gateway_order_id IS NOT NULL;