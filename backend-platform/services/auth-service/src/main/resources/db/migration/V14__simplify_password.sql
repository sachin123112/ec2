-- Update with plain text password for testing
UPDATE users 
SET password_hash = 'admin123'
WHERE email = 'admin@pawmart.com';
