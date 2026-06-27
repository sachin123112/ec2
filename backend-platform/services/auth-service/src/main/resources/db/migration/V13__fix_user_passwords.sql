-- Update user passwords with correct bcrypt hash for "admin123"
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye0R.xfYJsHlTx3m1Ek8DWqVkz0AkM9.e'
WHERE email IN ('admin@pawmart.com', 'gcpsachin17@gmail.com');
