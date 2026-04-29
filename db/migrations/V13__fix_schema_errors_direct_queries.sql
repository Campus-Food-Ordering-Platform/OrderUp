-- 1. Drop incorrect columns added directly to the database
ALTER TABLE menu_items DROP COLUMN IF EXISTS tags;
ALTER TABLE orders DROP COLUMN IF EXISTS items;

-- 2. Drop the availability enum
DROP TYPE IF EXISTS availability;

-- 3. Create category enum
CREATE TYPE menu_category AS ENUM ('Cafe', 'Fast Food', 'Asian', 'Pizza', 'Healthy', 'Indian');

-- 4. Drop default, cast category column to enum, restore default if needed
ALTER TABLE menu_items ALTER COLUMN category DROP DEFAULT;
UPDATE menu_items SET category = NULL WHERE category = 'Mains';
ALTER TABLE menu_items ALTER COLUMN category TYPE menu_category USING category::menu_category;

-- 5. Add columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;