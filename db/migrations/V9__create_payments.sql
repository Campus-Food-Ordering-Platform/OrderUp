CREATE TYPE payment_status AS ENUM ('pending','paid','failed');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    payment_reference VARCHAR(225),
    status payment_status DEFAULT 'pending',

    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id)

);