CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_paid NUMERIC(11,2),
    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id)
);