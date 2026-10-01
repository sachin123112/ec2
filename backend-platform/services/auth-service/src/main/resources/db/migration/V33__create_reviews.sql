CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    product_name VARCHAR(180) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PUBLISHED', 'PENDING', 'FLAGGED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_status_created_at ON reviews (status, created_at DESC);

INSERT INTO reviews (customer_name, product_name, rating, review_text, status, created_at) VALUES
('Priya Sharma', 'Premium Dog Food', 5, 'Excellent quality and my dog absolutely loves it.', 'PUBLISHED', '2026-09-18 11:30:00'),
('Sanjay Kumar', 'Interactive Cat Toy', 4, 'Good toy with sturdy build. Delivery was quick too.', 'PUBLISHED', '2026-09-17 15:10:00'),
('Ananya Rao', 'Aquarium Water Filter', 3, 'Works well, though the instructions could be clearer.', 'PENDING', '2026-09-16 09:20:00'),
('Rohit Mehta', 'Bird Cage', 5, 'Spacious and easy to assemble. Very happy with the purchase.', 'PUBLISHED', '2026-09-14 17:05:00'),
('Neha Reddy', 'Pet Grooming Kit', 2, 'The packaging arrived damaged and one item was missing.', 'FLAGGED', '2026-09-12 12:40:00');
