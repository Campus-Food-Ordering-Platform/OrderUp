CREATE TYPE dietary_tag_type AS ENUM(
    'Halaal', 'Vegetarian', 'Vegan', 'Kosher', --Halaal is the common SPelling in SA
    'Nut-Free', 'Gluten-Free', 'Dairy-Free'
);

CREATE TABLE menu_item_dietary_tags (
    menu_item_id UUID NOT NULL,
    tag dietary_tag_type NOT NULL,

    PRIMARY KEY (menu_item_id, tag),

    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id) ON DELETE CASCADE
);