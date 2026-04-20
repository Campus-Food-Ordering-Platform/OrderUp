DROP TABLE menu_item_allergens;
DROP TABLE allergen;

CREATE TYPE allergen_type AS ENUM(
    'Cow''s Milk',
    'Peanuts',
    'Tree Nuts',
    'Soya',
    'Gluten',--The source lists this as "Significant Cereals"
    'Egg',
    'Fish',
    'Shellfish' --The source lists this as "Crustaceans and Molluscs"
);

CREATE TABLE menu_item_allergens(
    menu_item_id UUID NOT NULL,
    allergen allergen_type NOT NULL,

    PRIMARY KEY (menu_item_id, allergen),

    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id)
    REFERENCES menu_items(id) ON DELETE CASCADE
);