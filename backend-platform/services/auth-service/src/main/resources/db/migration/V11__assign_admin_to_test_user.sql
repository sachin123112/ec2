-- Assign ADMIN role to test user if exists
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'gcpsachin17@gmail.com' AND r.name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);
