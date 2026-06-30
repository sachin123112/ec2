-- Seed default roles for auth-service
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrator with full access'),
('USER', 'Standard user role')
ON CONFLICT DO NOTHING;
