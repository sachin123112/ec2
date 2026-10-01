ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_brand_id ON categories (brand_id);