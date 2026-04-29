CREATE TYPE vendor_application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category menu_category[],
  description TEXT,
  location TEXT,
  operating_hours JSONB,
  health_certificate_url TEXT,
  sample_items TEXT,
  status vendor_application_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT
);