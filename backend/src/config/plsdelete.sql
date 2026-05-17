DELETE FROM vendors WHERE application_id = (
  SELECT id FROM vendor_applications WHERE name ILIKE '%kimchi%'
);

DELETE FROM vendor_applications WHERE name ILIKE '%kimchi%';
