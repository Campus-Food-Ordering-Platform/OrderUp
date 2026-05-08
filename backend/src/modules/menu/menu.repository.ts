import pool from '../../config/db';
import { MenuItem } from './menu.model';

export const insertMenuItem = async (
    vendorId: string,
    name: string,
    description: string,
    price: number,
    image_url: string
): Promise<MenuItem> => {
    const result = await pool.query(
        'INSERT INTO menu_items (vendor_id, name, description, price, image_url) VALUES ($1, $2, $3, $4,$5) RETURNING *',
        [vendorId, name, description, price, image_url]
    );
    return result.rows[0];
};

export const findMenuItemsByVendor = async (vendorId: string): Promise<MenuItem[]> => {
    const result = await pool.query(
        'SELECT * FROM menu_items WHERE vendor_id = $1',
        [vendorId]
    );
    return result.rows;
};

export const removeMenuByVendorId = async (vendor_id: string): Promise<void> => {
    await pool.query(
        'DELETE FROM menu_items WHERE id = $1',
        [vendor_id]
    );
};
// update the menu 
export const updateMenuItemById = async (
    itemId: string,// keep in mind i just remembered now to change the Item id to string as we using UUID
    name: string,
    description: string,
    price: number,
    image_url: string,
): Promise<MenuItem> => {
    const result = await pool.query(
        `UPDATE menu_items
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             price = COALESCE($3, price),
             image_url = COALESCE($4, image_url)
         WHERE id = $5 RETURNING *`,
        [name, description, price,image_url, itemId]
    );
    return result.rows[0];
};//coalesce just means return the first non null element. not sure how it works but it allows us to return the old value if there is no new value.