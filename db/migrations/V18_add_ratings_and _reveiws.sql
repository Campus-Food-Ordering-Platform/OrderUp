ALTER TABLE orders
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN review TEXT;

-- Adding the columns for rating with stars and and leaving a reveiw for every order