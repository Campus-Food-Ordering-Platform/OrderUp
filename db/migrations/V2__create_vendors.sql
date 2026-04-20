CREATE TYPE open_status AS ENUM ('Yes','No');

CREATE TABLE vendors(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL, 
    description TEXT,
    is_open open_status NOT NULL,
    logo_url TEXT,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id)
    REFERENCES profiles(id) ON DELETE CASCADE
);     