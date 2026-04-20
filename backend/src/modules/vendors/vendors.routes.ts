// /backend/src/modules/vendors/vendors.routes.ts
import { Router, Request, Response } from 'express';
import pool from '../../config/db'; // PostgreSQL pool from db.ts
import { getMenuItemsByVendor } from '../menu/menu.service';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/vendors
// Returns all vendors — used by StudentDashboard to populate the grid
// _req is used instead of req because we don't need the request object here
// ─────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_open, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    ORDER BY v.id ASC
`);
    res.json(result.rows);
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching vendors:', error.message);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/vendors/:id
// Returns a single vendor by ID — used when opening a vendor store
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
  const result = await pool.query(`
    SELECT v.id, v.description, v.is_open, v.logo_url, p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
    WHERE v.id = $1
  `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching vendor:', error.message);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/vendors/:id/menu
// Returns all menu items for a specific vendor
// Used by VendorMenu page when a student clicks a vendor store
// ─────────────────────────────────────────────────────────────
router.get('/:id/menu', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY category, name ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching menu:', error.message);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/vendors/:id/menu
// Vendor adds a new menu item to their store
// Body: { name, description, price, category, imageurl }
// ─────────────────────────────────────────────────────────────
router.post('/:id/menu', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, category, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO menu_items (vendor_id, name, description, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, description, price, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Error adding menu item:', error.message);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/vendors/:id/menu/:itemId
// Vendor updates an existing menu item
// ─────────────────────────────────────────────────────────────
router.put('/:id/menu/:itemId', async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const { name, description, price, category, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE menu_items
       SET name=$1, description=$2, price=$3, category=$4, image_url=$5
       WHERE id=$6 AND vendor_id=$7
       RETURNING *`,
      [name, description, price, category, image_url, itemId, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Error updating menu item:', error.message);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/vendors/:id/menu/:itemId
// Vendor removes a menu item from their store
// ─────────────────────────────────────────────────────────────
router.delete('/:id/menu/:itemId', async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  try {
    await pool.query(
      'DELETE FROM menu_items WHERE id = $1 AND vendor_id = $2',
      [itemId, id]
    );
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    const error = err as Error;
    console.error('Error deleting menu item:', error.message);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/vendors/register
// Creates a new vendor record linked to an existing profile
// Body: { profile_id, description, logo_url }
// Called once during vendor onboarding after Auth0 login
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// POST /api/vendors/register
// Upserts a vendor record linked to an existing profile.
// Safe to call multiple times — returns existing row if already registered.
// Body: { profile_id, description, logo_url }
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { profile_id, description, logo_url } = req.body;

  if (!profile_id) {
    return res.status(400).json({ error: 'profile_id is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vendors (id, profile_id, description, is_open, logo_url)
       VALUES (gen_random_uuid(), $1, $2, 'Yes'::open_status, $3)
       ON CONFLICT (profile_id) DO UPDATE SET profile_id = EXCLUDED.profile_id
       RETURNING *`,
      [profile_id, description ?? null, logo_url ?? null]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Error registering vendor:', error.message);
    res.status(500).json({ error: 'Failed to register vendor' });
  }
});

export default router;