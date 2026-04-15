CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'suspended');

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  vendor_status vendor_status,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(32)
);