-- Supports bounded order history and admin status/date reporting.
CREATE INDEX IF NOT EXISTS idx_orders_user_created_id
    ON orders (user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_id
    ON orders (status, created_at DESC, id DESC);

-- Supports product/category listings and joins on the deployed category_id FK.
CREATE INDEX IF NOT EXISTS idx_products_category_created_id
    ON products (category_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_products_created_id
    ON products (created_at DESC, id DESC);

-- Supports product image loading and avoids FK delete/update scans.
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images (product_id);

-- Supports common ownership and token-expiry maintenance queries.
CREATE INDEX IF NOT EXISTS idx_addresses_user_id
    ON addresses (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
    ON password_reset_tokens (expires_at);
