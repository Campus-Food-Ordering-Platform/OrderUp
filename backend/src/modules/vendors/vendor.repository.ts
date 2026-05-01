import pool from '../../config/db';

// ───────────── Vendors ─────────────

// Fetch all vendors with their profile name (used on student dashboard)
export const getAllVendors = async () => {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_active, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    ORDER BY v.id ASC
  `);
  return result.rows;
};

// Fetch a single vendor by their ID
export const getVendorById = async (id: string) => {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_active, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    WHERE v.id = $1
  `, [id]);
  return result.rows[0];
};

// ───────────── Menu ─────────────

// Fetch all menu items for a vendor — returns available AND unavailable
// items so the student menu page can show "Out of stock" for unavailable ones
export const getVendorMenu = async (vendorId: string) => {
  const result = await pool.query(
    `SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY category, name ASC`,
    [vendorId]
  );
  return result.rows;
};

// Create a new menu item — includes tags and available from the start
// so the vendor dashboard toggle works immediately after creation
export const createMenuItem = async (vendorId: string, body: any) => {
  const result = await pool.query(
    `INSERT INTO menu_items (vendor_id, name, description, price, category, image_url, tags, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      vendorId,
      body.name,
      body.description,
      body.price,
      body.category,
      body.image_url,
      body.tags ?? [],    // raw array — pg driver serializes text[] natively
      body.available ?? true,
    ]
  );
  return result.rows[0];
};

// Update a menu item — includes tags and available so the availability
// toggle persists after refresh and tags are not wiped on edit
export const updateMenuItem = async (
  vendorId: string,
  itemId: string,
  body: any
) => {
  const result = await pool.query(
    `UPDATE menu_items
     SET name=$1, description=$2, price=$3, category=$4, image_url=$5, tags=$6, available=$7
     WHERE id=$8 AND vendor_id=$9
     RETURNING *`,
    [
      body.name,
      body.description,
      body.price,
      body.category,
      body.image_url,
      body.tags ?? [],    // raw array — pg driver serializes text[] natively
      body.available ?? true,
      itemId,
      vendorId,
    ]
  );
  return result.rows[0]; // returns undefined if not found — controller handles 404
};

// Delete a menu item — vendor_id check prevents deleting another vendor's items
export const deleteMenuItem = async (vendorId: string, itemId: string) => {
  await pool.query(
    `DELETE FROM menu_items WHERE id=$1 AND vendor_id=$2`,
    [itemId, vendorId]
  );
};

// ───────────── Register ─────────────

// Register a vendor profile — uses ON CONFLICT so calling this multiple times
// for the same profile_id is safe (idempotent). Used on every vendor login
// to resolve their vendor ID from their profile ID.
export const registerVendor = async (body: any) => {

  
  const result = await pool.query(
    `INSERT INTO vendors (id, profile_id, description, is_active, logo_url)
     VALUES (gen_random_uuid(), $1, $2, 'Yes'::active_status, $3)
     ON CONFLICT (profile_id)
     DO UPDATE SET profile_id = EXCLUDED.profile_id
     RETURNING *`,
    [body.profile_id, body.description ?? null, body.logo_url ?? null]
  );
  return result.rows[0];
};