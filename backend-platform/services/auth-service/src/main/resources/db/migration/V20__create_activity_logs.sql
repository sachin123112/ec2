CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(32) NOT NULL,
    message VARCHAR(500) NOT NULL,
    source VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

INSERT INTO activity_logs (type, message, source)
VALUES
    ('Info', 'Admin login successful', 'system'),
    ('Order', 'Order activity tracking enabled', 'system'),
    ('Warning', 'Review system activity settings', 'system'),
    ('Backup', 'Database backup tracking enabled', 'system');