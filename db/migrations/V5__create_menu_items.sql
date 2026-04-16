CREATE TYPE item_availability AS ENUM('available','sold out','low supply');

CREATE TABLE menu_items(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    availability item_availability NOT NULL DEFAULT 'available',
    image_url TEXT,
    CONSTRAINT fk_vendor FOREIGN KEY (vendor_id)
    REFERENCES vendors(id) ON DELETE CASCADE
);