// repositry can only access database

// First we want to get an analytic. 
// the timestamp data  type can be called using different time intervals with DATA_TRUNC() 

// lets start easy with:
// number of orders made
// pool must also be imported:
import pool from '../../config/db';
// A pool is a set of pre-created database connections that our backend reuses instead of opening a new connection every time.
// pool can be found in backend/src/config/db.ts
// getOrderAmount function below
export const getOrderTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    const result = await pool.query(`
        SELECT
        DATE_TRUNC('${interval}', created_at) AS period,
        COUNT(*) AS orders
        FROM orders
        WHERE vendor_id = $1
        GROUP BY period
        ORDER BY period;
        `, [vendor_id]);
    return result.rows

    
}
// Similarly other functions can be made. we need functions for: total revenue, total profit, total (unique)  customers
// that's EASY!!!!!! lets go
// well the total revenue is. lets first start with the getOrderTotal function as a template and edit it
// a simple SUM fuunction to replace COUNT() is enough.
export const getRevenueTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    const result = await pool.query(`
        SELECT
        DATE_TRUNC('${interval}', created_at) AS period,
        SUM(total_amount) as revenue
        FROM orders
        WHERE vendor_id = $1
        GROUP BY period
        ORDER BY period;
        `, [vendor_id]);
    return result.rows

    
}
// now we do soomething slightly harder, profit. This may require extra info 
// OH NO! The database has an issue! 
// the cost of an item might change as time goes on so it must be stored in the orders section to keep an accurate history of the orders
// Simply using menu items is not enough
// It is decided we are removing profit from analytics

// customer count:
export const getCustomerTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    const result = await pool.query(`
        SELECT
        DATE_TRUNC('${interval}', created_at) AS period,
        COUNT(DISTINCT customer_id) AS unique_customers
        FROM orders
        WHERE vendor_id = $1
        GROUP BY period
        ORDER BY period;
        `, [vendor_id]);
    return result.rows

    
}
// thats it for now. db needs to be updated to call customer reveiws, and likes /dislikes for items