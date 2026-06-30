-- Add country code and profile image support to user profile
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91',
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(512);
