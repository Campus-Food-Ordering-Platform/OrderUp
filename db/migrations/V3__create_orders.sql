CREATE TYPE order_status AS ENUM ('sending','recieved','preparing','ready','collected');


CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    status order_status NOT NULL DEFAULT 'sending',
    vendor_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    total_amount NUMERIC(11,2),
    CONSTRAINT fk_customer FOREIGN KEY customer_id REFERENCES profiles(id),
    CONSTRAINT fk_vendor FOREIGN KEY vendor_id REFERENCES vendors(id)

);