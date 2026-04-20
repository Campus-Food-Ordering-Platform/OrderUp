CREATE TABLE menu_item_allergens(
    menu_item_id UUID NOT NULL,
    allergen_id UUID NOT NULL,

    PRIMARY KEY(menu_item_id,allergen_id),

    CONSTRAINT fk_allergen FOREIGN KEY (allergen_id)
    REFERENCES allergen(id) ON DELETE CASCADE,

    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id)
    REFERENCES menu_items(id) ON DELETE CASCADE
);