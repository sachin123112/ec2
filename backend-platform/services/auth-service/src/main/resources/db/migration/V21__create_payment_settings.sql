CREATE TABLE IF NOT EXISTS payment_settings (
    id BIGINT PRIMARY KEY,
    razorpay_key_id VARCHAR(255),
    razorpay_key_secret VARCHAR(255),
    stripe_active BOOLEAN NOT NULL DEFAULT FALSE,
    paypal_active BOOLEAN NOT NULL DEFAULT FALSE,
    cash_on_delivery_active BOOLEAN NOT NULL DEFAULT TRUE,
    upi_active BOOLEAN NOT NULL DEFAULT TRUE,
    upi_id VARCHAR(255) NOT NULL DEFAULT 'sachinprakash893@ybl',
    free_shipping_threshold NUMERIC(12, 2) NOT NULL DEFAULT 999,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 99
);

INSERT INTO payment_settings (id, razorpay_key_id, razorpay_key_secret)
VALUES (1, 'rzp_live_example', NULL)
ON CONFLICT (id) DO NOTHING;