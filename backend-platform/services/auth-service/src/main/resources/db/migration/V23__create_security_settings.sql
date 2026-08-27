CREATE TABLE IF NOT EXISTS security_settings (
    id BIGINT PRIMARY KEY,
    two_factor_auth BOOLEAN NOT NULL DEFAULT TRUE,
    password_policy BOOLEAN NOT NULL DEFAULT TRUE,
    minimum_password_length VARCHAR(32) NOT NULL DEFAULT '8 Characters',
    session_timeout VARCHAR(32) NOT NULL DEFAULT '30 Minutes',
    login_attempts VARCHAR(32) NOT NULL DEFAULT '5 Attempts',
    ip_whitelist BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO security_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;