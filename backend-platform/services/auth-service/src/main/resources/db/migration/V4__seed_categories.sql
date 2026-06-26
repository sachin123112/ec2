-- Seed categories for auth-service DB
INSERT INTO categories (name) VALUES
('Dogs'),
('Fish'),
('Plants'),
('Birds'),
('Pet Food'),
('Fish Food'),
('Aquarium Plants'),
('Aquarium Tanks'),
('Aquarium Stone and Wood')
ON CONFLICT DO NOTHING;
