CREATE TABLE allergen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allergen VARCHAR(32)
);