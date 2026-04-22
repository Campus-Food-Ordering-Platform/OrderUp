import pool from '../../config/db';

// ───────────── Vendors ─────────────

export const getAllVendors = async () => {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_open, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    ORDER BY v.id ASC
  `);
  return result.rows;
};

export const getVendorById = async (id: string) => {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_open, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    WHERE v.id = $1
  `, [id]);

  return result.rows[0];
};

// ───────────── Menu ─────────────

export const getVendorMenu = async (vendorId: string) => {
  const result = await pool.query(
    `SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY category, name ASC`,
    [vendorId]
  );
  return result.rows;
};

export const createMenuItem = async (vendorId: string, body: any) => {
  const result = await pool.query(
    `INSERT INTO menu_items (vendor_id, name, description, price, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      vendorId,
      body.name,
      body.description,
      body.price,
      body.category,
      body.image_url
    ]
  );

  return result.rows[0];
};

export const updateMenuItem = async (
  vendorId: string,
  itemId: string,
  body: any
) => {
  const result = await pool.query(
    `UPDATE menu_items
     SET name=$1, description=$2, price=$3, category=$4, image_url=$5
     WHERE id=$6 AND vendor_id=$7
     RETURNING *`,
    [
      body.name,
      body.description,
      body.price,
      body.category,
      body.image_url,
      itemId,
      vendorId
    ]
  );

  return result.rows[0];
};

export const deleteMenuItem = async (vendorId: string, itemId: string) => {
  await pool.query(
    `DELETE FROM menu_items WHERE id=$1 AND vendor_id=$2`,
    [itemId, vendorId]
  );
};

// ───────────── Register ─────────────

export const registerVendor = async (body: any) => {
  const result = await pool.query(
    `INSERT INTO vendors (id, profile_id, description, is_open, logo_url)
     VALUES (gen_random_uuid(), $1, $2, 'Yes'::open_status, $3)
     ON CONFLICT (profile_id)
     DO UPDATE SET profile_id = EXCLUDED.profile_id
     RETURNING *`,
    [body.profile_id, body.description ?? null, body.logo_url ?? null]
  );

  return result.rows[0];
};