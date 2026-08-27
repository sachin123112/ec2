CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission VARCHAR(150) NOT NULL,
    PRIMARY KEY (role_id, permission)
);

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, permissions.permission
FROM roles r
JOIN (VALUES
    ('ADMIN', 'Manage users'), ('ADMIN', 'Manage products'), ('ADMIN', 'Manage orders'), ('ADMIN', 'Manage settings'),
    ('USER', 'Browse products'), ('USER', 'Place orders'), ('USER', 'Manage profile'),
    ('MOBILE_ADMIN', 'View mobile dashboard'), ('MOBILE_ADMIN', 'Manage users'), ('MOBILE_ADMIN', 'Manage orders'), ('MOBILE_ADMIN', 'Manage settings'),
    ('MOBILE_USER', 'Browse mobile catalog'), ('MOBILE_USER', 'Place mobile orders'), ('MOBILE_USER', 'Manage mobile profile')
) AS permissions(role_name, permission) ON r.name = permissions.role_name
ON CONFLICT DO NOTHING;