INSERT INTO roles (name, description) VALUES
('MOBILE_ADMIN', 'Mobile administrator with management access'),
('MOBILE_USER', 'Mobile customer with shopping access')
ON CONFLICT DO NOTHING;