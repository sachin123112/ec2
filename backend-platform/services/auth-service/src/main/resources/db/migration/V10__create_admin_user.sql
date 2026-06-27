-- Create default admin user if not exists
-- Password: admin123 (bcrypt hash: $2a$10$wXO8xqh3tq4BT9ZmTbFsH.t.V1D2v9IwPQ3rVZjJmzMqhKBm4jJve)
INSERT INTO users (username, email, password_hash, first_name, last_name, status)
VALUES ('admin', 'admin@pawmart.com', '$2a$10$wXO8xqh3tq4BT9ZmTbFsH.t.V1D2v9IwPQ3rVZjJmzMqhKBm4jJve', 'System', 'Admin', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@pawmart.com' AND r.name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);
