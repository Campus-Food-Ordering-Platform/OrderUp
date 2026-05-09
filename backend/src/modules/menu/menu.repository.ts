import pool from '../../config/db';
import { MenuItem } from './menu.model';
import { MenuCategory } from '../../types/enums';

export const insertMenuItem = async (
    vendorId: string,
    name: string,
    description: string,
    price: number,
    image_url: string,
    category: MenuCategory,
    available: boolean,
    allergens: string[],
    tags: string[]
): Promise<MenuItem> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert the menu item
        const result = await client.query(
            `INSERT INTO menu_items (vendor_id, name, description, price, image_url, category, available) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [vendorId, name, description, price, image_url, category, available]
        );
        const menuItem = result.rows[0];

        // Insert allergens into junction table
        for (const allergen of allergens) {
            await client.query(
                `INSERT INTO menu_item_allergens (menu_item_id, allergen) VALUES ($1, $2)`,
                [menuItem.id, allergen]
            );
        }

        // Insert dietary tags into junction table
        for (const tag of tags) {
            await client.query(
                `INSERT INTO menu_item_dietary_tags (menu_item_id, tag) VALUES ($1, $2)`,
                [menuItem.id, tag]
            );
        }

        await client.query('COMMIT');
        return menuItem;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/* Query refactor: previously Siya was having issues with the junction tables, linkind menu_items and their respective allergens and tags
The solutiokn is Joins, we join the menu_items table (left) to the menu_item_allergens and menu_item_dietary_tags (individually)
*/
export const findMenuItemsByVendor = async (vendorId: string): Promise<MenuItem[]> => {
    const result = await pool.query(
        `SELECT 
          m.id,
          m.vendor_id,
          m.name,
          m.description,
          m.price,
          m.image_url,
          m.category,
          m.available,
          ARRAY_AGG(a.allergen) FILTER (WHERE a.allergen IS NOT NULL) AS allergens,
          ARRAY_AGG(t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags
        FROM menu_items m
        LEFT JOIN menu_item_allergens a ON a.menu_item_id = m.id
        LEFT JOIN menu_item_dietary_tags t ON t.menu_item_id = m.id
        WHERE m.vendor_id = $1
        GROUP BY m.id`,
        [vendorId]
    );
    return result.rows;
};

export const removeMenuItemByitemId = async (itemId: string): Promise<void> => {
    await pool.query(
        'DELETE FROM menu_items WHERE id = $1',
        [itemId]
    );
};
// update the menu 
export const updateMenuItemById = async (
    itemId: string,
    name: string,
    description: string,
    price: number,
    image_url: string,
    category: MenuCategory,
    available: boolean,
    allergens: string[],
    tags: string[]
): Promise<MenuItem> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE menu_items
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 image_url = COALESCE($4, image_url),
                 category = COALESCE($5, category),
                 available = COALESCE($6, available)
             WHERE id = $7 
             RETURNING *`,
            [name, description, price, image_url, category, available, itemId]
        );
        const menuItem = result.rows[0];

        // Replace allergens
        await client.query(
            'DELETE FROM menu_item_allergens WHERE menu_item_id = $1',
            [itemId]
        );
        for (const allergen of allergens) {
            await client.query(
                'INSERT INTO menu_item_allergens (menu_item_id, allergen) VALUES ($1, $2)',
                [itemId, allergen]
            );
        }

        // Replace dietary tags
        await client.query(
            'DELETE FROM menu_item_dietary_tags WHERE menu_item_id = $1',
            [itemId]
        );
        for (const tag of tags) {
            await client.query(
                'INSERT INTO menu_item_dietary_tags (menu_item_id, tag) VALUES ($1, $2)',
                [itemId, tag]
            );
        }

        await client.query('COMMIT');
        return menuItem;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
//coalesce just means return the first non null element. not sure how it works but it allows us to return the old value if there is no new value.