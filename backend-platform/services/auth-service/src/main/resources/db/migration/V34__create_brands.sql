CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    logo_url VARCHAR(2048),
    tone VARCHAR(24) NOT NULL DEFAULT 'blue',
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_created_at ON brands (created_at DESC);

INSERT INTO brands (name, tone, status, product_count, created_at) VALUES
('Royal Canin', 'red', 'ACTIVE', 42, '2026-07-12 10:00:00'),
('Pedigree', 'gold', 'ACTIVE', 36, '2026-07-11 10:00:00'),
('Whiskas', 'purple', 'ACTIVE', 28, '2026-07-10 10:00:00'),
('Me-O', 'coral', 'ACTIVE', 21, '2026-07-09 10:00:00'),
('Drools', 'blue', 'ACTIVE', 18, '2026-07-08 10:00:00'),
('Himalaya', 'teal', 'ACTIVE', 12, '2026-07-07 10:00:00'),
('Purina', 'black', 'ACTIVE', 15, '2026-07-06 10:00:00'),
('Hills', 'red', 'INACTIVE', 8, '2026-07-05 10:00:00'),
('Sheba', 'black', 'ACTIVE', 17, '2026-07-04 10:00:00'),
('Tetra', 'gold', 'ACTIVE', 24, '2026-07-03 10:00:00');
