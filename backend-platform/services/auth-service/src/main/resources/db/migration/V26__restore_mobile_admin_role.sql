INSERT INTO roles (name, description)
VALUES ('MOBILE_ADMIN', 'Mobile administrator with management access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, permissions.permission
FROM roles r
JOIN (VALUES
    ('View mobile dashboard'), ('Manage users'), ('Manage orders'), ('Manage settings')
) AS permissions(permission) ON r.name = 'MOBILE_ADMIN'
ON CONFLICT DO NOTHING;