CREATE TYPE vendor_status AS ENUM ('active', 'suspended');

ALTER TABLE vendors ALTER COLUMN is_open DROP DEFAULT;
ALTER TABLE vendors ALTER COLUMN is_open TYPE BOOLEAN USING CASE WHEN is_open::TEXT = 'Yes' THEN true ELSE false END;
ALTER TABLE vendors RENAME COLUMN is_open TO is_active;
DROP TYPE IF EXISTS open_status;


ALTER TABLE vendors ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES vendor_applications(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS operating_hours JSONB;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category menu_category[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS status vendor_status NOT NULL DEFAULT 'active';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS banner_url TEXT;