CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  settings_json TEXT NOT NULL
);

INSERT INTO system_settings (settings_json)
VALUES ('{}');
