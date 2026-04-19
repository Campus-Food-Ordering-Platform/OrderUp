CREATE TYPE order_status AS ENUM ('sending','received','preparing','ready','collected');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    status order_status NOT NULL DEFAULT 'sending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(11,2),

    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES profiles(id),
    CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);