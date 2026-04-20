import pool from '../../config/db';
import { MenuItem } from './menu.model';

export const insertMenuItem = async (
    vendorId: number,
    name: string,
    description: string,
    price: number
): Promise<MenuItem> => {
    const result = await pool.query(
        'INSERT INTO menu_items (vendor_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [vendorId, name, description, price]
    );
    return result.rows[0];
};

export const findMenuItemsByVendor = async (vendorId: number): Promise<MenuItem[]> => {
    const result = await pool.query(
        'SELECT * FROM menu_items WHERE vendor_id = $1',
        [vendorId]
    );
    return result.rows;
};

export const removeMenuItemById = async (itemId: number): Promise<void> => {
    await pool.query(
        'DELETE FROM menu_items WHERE id = $1',
        [itemId]
    );
};

export const updateMenuItemById = async (
    itemId: number,
    name: string,
    description: string,
    price: number
): Promise<MenuItem> => {
    const result = await pool.query(
        `UPDATE menu_items
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             price = COALESCE($3, price)
         WHERE id = $4 RETURNING *`,
        [name, description, price, itemId]
    );
    return result.rows[0];
};