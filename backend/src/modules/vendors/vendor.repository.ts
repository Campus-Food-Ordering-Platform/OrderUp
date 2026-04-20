import pool from '../../config/db';

export const getAllVendors = async () => {
  const result = await pool.query(`
    SELECT
      v.id,
      v.description,
      v.is_open,
      v.logo_url,
      p.name
    FROM vendors v
    JOIN profiles p ON v.profile_id = p.id
  `);
  return result.rows;
};