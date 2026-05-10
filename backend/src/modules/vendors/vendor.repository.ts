import pool from '../../config/db';

// ───────────── Vendors ─────────────

// Fetch all valid vendors with their profile name (used on student dashboard)
export const getAllVendors = async () => {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_active, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    WHERE v.status = 'active'
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
  const values = [
    vendorId,
    body.name,
    body.description ?? null,
    body.price,
    body.category ?? null,
    body.image_url ?? null,
    body.tags ?? [],
    body.available ?? true,
  ];
  const result = await pool.query(
    `INSERT INTO menu_items (vendor_id, name, description, price, category, image_url, tags, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    values
  );
  return result.rows[0];
};

// Update a menu item — includes tags and available so the availability
// toggle persists after refresh and tags are not wiped on edit
export const updateMenuItem = async (vendorId: string, itemId: string, body: any) => {
  const result = await pool.query(
    `UPDATE menu_items
     SET name=$1, description=$2, price=$3, category=$4, image_url=$5, available=$6, tags=$7
     WHERE id=$8 AND vendor_id=$9
     RETURNING *`,
    [
      body.name,
      body.description ?? null,
      body.price,
      body.category ?? null,
      body.image_url ?? null,
      body.available ?? true,
      body.tags ?? [],
      itemId,
      vendorId,
    ]
  );
  return result.rows[0];
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
export const submitVendorApplication = async (body: any) => {
  const result = await pool.query(
    `INSERT INTO vendor_applications 
      (profile_id, name, description, category, location, operating_hours, 
       health_certificate_url, sample_items)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      body.profile_id,
      body.name,
      body.description ?? null,
      body.category ?? null,        
      body.location ?? null,
      body.operating_hours ? JSON.stringify(body.operating_hours) : null,
      body.health_certificate_url ?? null,
      body.sample_items ?? null,
    ]
  );
  return result.rows[0];
};
export const getVendorStatusByProfileId = async (profileId: string) => {
  // First check if they have an approved vendor row
  const vendorResult = await pool.query(
    `SELECT v.id, v.status, v.vendor_name as name FROM vendors v WHERE v.profile_id = $1`,
    [profileId]
  );
  if (vendorResult.rows[0]) return { type: 'vendor', ...vendorResult.rows[0] };

  // Otherwise check for a pending/rejected application
  const appResult = await pool.query(
    `SELECT id, status, name FROM vendor_applications WHERE profile_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
    [profileId]
  );
  if (appResult.rows[0]) return { type: 'application', ...appResult.rows[0] };

  return null;
};
// ───────────── admin ─────────────
export const updateVendorStatus = async (vendorId: string, status: 'active' | 'suspended') => {//for admin to change a vendor's status
  const result = await pool.query(
    `UPDATE vendors SET status = $1 WHERE id = $2 RETURNING *`,
    [status, vendorId]
  );
  return result.rows[0];
};

export const getAllVendorsAdmin = async () => {
  const result = await pool.query(`
    SELECT
      v.id,
      v.vendor_name,
      v.description,
      v.category,
      v.location,
      v.operating_hours,
      v.status                  AS vendor_status,
      v.is_active,
      v.application_id,
      p.name                    AS owner_name,
      p.created_at              AS join_date,
      va.id                     AS application_id,
      va.status                 AS application_status,
      va.health_certificate_url,
      va.sample_items,
      va.submitted_at,
      va.rejection_reason,
      va.description            AS app_description,
      va.location               AS app_location,
      va.operating_hours        AS app_operating_hours,
      COALESCE(SUM(o.total_amount), 0) AS revenue,
      COUNT(o.id)               AS orders
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    LEFT JOIN vendor_applications va ON va.id = v.application_id
    LEFT JOIN orders o ON o.vendor_id = v.id
    GROUP BY
      v.id, v.vendor_name, v.description, v.category, v.location,
      v.operating_hours, v.status, v.is_active, v.application_id,
      p.name, p.created_at,
      va.id, va.status, va.health_certificate_url, va.sample_items,
      va.submitted_at, va.rejection_reason, va.description,
      va.location, va.operating_hours
    ORDER BY
      CASE v.status
        WHEN 'active'    THEN 1
        WHEN 'suspended' THEN 2
      END,
      v.vendor_name ASC
  `);
  return result.rows;
};
export const getPendingApplications = async () => {
  const result = await pool.query(`
    SELECT
      va.id,
      va.name                   AS vendor_name,
      va.description,
      va.category,
      va.location,
      va.operating_hours,
      va.health_certificate_url,
      va.sample_items,
      va.submitted_at,
      va.rejection_reason,
      va.status                 AS application_status,
      NULL                      AS vendor_status,
      p.name                    AS owner_name,
      p.created_at              AS join_date,
      va.id                     AS application_id,
      0                         AS revenue,
      0                         AS orders
    FROM vendor_applications va
    JOIN profiles p ON va.profile_id = p.id
    WHERE va.status = 'pending'
    ORDER BY va.submitted_at ASC
  `);
  return result.rows;
};
export const approveApplication = async (applicationId: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Mark application as approved
    await client.query(
      `UPDATE vendor_applications SET status = 'approved', reviewed_at = NOW() WHERE id = $1`,
      [applicationId]
    );

    // 2. Get application data to create vendor
    const appResult = await client.query(
      `SELECT * FROM vendor_applications WHERE id = $1`,
      [applicationId]
    );
    const app = appResult.rows[0];
    if (!app) throw new Error('Application not found');

    // 3. Create vendor row
    const vendorResult = await client.query(
      `INSERT INTO vendors 
        (id, profile_id, application_id, vendor_name, description, category, 
         location, operating_hours, status, is_active)
       VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'active', true)
       RETURNING *`,
      [
        app.profile_id,
        app.id,
        app.name,
        app.description,
        app.category,
        app.location,
        app.operating_hours,
      ]
    );

    await client.query('COMMIT');
    return vendorResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const rejectApplication = async (applicationId: string, rejectionReason?: string) => {
  const result = await pool.query(
    `UPDATE vendor_applications 
     SET status = 'rejected', reviewed_at = NOW(), rejection_reason = $2 
     WHERE id = $1 
     RETURNING *`,
    [applicationId, rejectionReason ?? null]
  );
  return result.rows[0];
};