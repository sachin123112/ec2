CREATE TABLE mobile_banners (
    id BIGSERIAL PRIMARY KEY,
    page_key VARCHAR(32) NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mobile_banners_page_created
    ON mobile_banners (page_key, created_at DESC, id DESC);