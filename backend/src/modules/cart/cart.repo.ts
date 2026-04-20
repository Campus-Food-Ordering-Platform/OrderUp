import pool from "../../config/db";

// 🔹 Define DB row type
export type CartItem = {
  id: number;
  user_id: number;
  menu_item_id: number;
  quantity: number;
};

// 🔹 Extended type with menu info (JOIN)
export type CartItemWithMenu = CartItem & {
  name: string;
  price: number;
  vendor_id: number;
};

// 🔍 Find existing cart item
export const findCartItem = async (
  userId: number,
  itemId: number
): Promise<CartItem | null> => {
  const result = await pool.query(
    "SELECT * FROM cart_items WHERE user_id = $1 AND menu_item_id = $2",
    [userId, itemId]
  );

  return result.rows[0] || null;
};

// ➕ Insert new item
export const insertCartItem = async (
  userId: number,
  itemId: number
): Promise<CartItem> => {
  const result = await pool.query(
    `INSERT INTO cart_items (user_id, menu_item_id, quantity)
     VALUES ($1, $2, 1)
     RETURNING *`,
    [userId, itemId]
  );

  return result.rows[0];
};

// ⬆️ Increment quantity
export const incrementCartItem = async (
  userId: number,
  itemId: number
): Promise<CartItem> => {
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = quantity + 1
     WHERE user_id = $1 AND menu_item_id = $2
     RETURNING *`,
    [userId, itemId]
  );

  return result.rows[0];
};

// ⬇️ Decrement quantity
export const decrementCartItem = async (
  userId: number,
  itemId: number
): Promise<CartItem> => {
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = quantity - 1
     WHERE user_id = $1 AND menu_item_id = $2
     RETURNING *`,
    [userId, itemId]
  );

  return result.rows[0];
};

// ❌ Delete item
export const deleteCartItem = async (
  userId: number,
  itemId: number
): Promise<void> => {
  await pool.query(
    "DELETE FROM cart_items WHERE user_id = $1 AND menu_item_id = $2",
    [userId, itemId]
  );
};

// 🛒 Get full cart with menu info
export const getCartItems = async (
  userId: number
): Promise<CartItemWithMenu[]> => {
  const result = await pool.query(
    `
    SELECT ci.*, mi.name, mi.price, mi.vendor_id
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE ci.user_id = $1
    `,
    [userId]
  );

  return result.rows;
};