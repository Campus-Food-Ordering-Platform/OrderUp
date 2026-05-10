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
    interval : 'hour'|'day'|'week'|'month'|'year',
    window: string = 'total'
) => {

    const hasWindow = window !== 'total';

    const query = `
        SELECT
            DATE_TRUNC('${interval}', created_at) AS period,
            COUNT(*) AS orders
        FROM orders
        WHERE vendor_id = $1
        ${hasWindow ? `AND created_at >= NOW() - INTERVAL '${window}'` : ''}
        GROUP BY period
        ORDER BY period;
    ` ;
    const result = await pool.query(query,[vendor_id])
    return result.rows

    
}
// Similarly other functions can be made. we need functions for: total revenue, total profit, total (unique)  customers
// that's EASY!!!!!! lets go
// well the total revenue is. lets first start with the getOrderTotal function as a template and edit it
// a simple SUM fuunction to replace COUNT() is enough.
export const getRevenueTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year',
    window: string = 'total'
) => {

    const hasWindow = window !== 'total';

    const query = `
        SELECT
            DATE_TRUNC('${interval}', created_at) AS period,
            SUM(total_amount) AS revenue
        FROM orders
        WHERE vendor_id = $1
        ${hasWindow ? `AND created_at >= NOW() - INTERVAL '${window}'` : ''}
        GROUP BY period
        ORDER BY period;
    `;

    const result = await pool.query(query, [vendor_id]);
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
    interval : 'hour'|'day'|'week'|'month'|'year',
    window: string = 'total'
) => {

    const hasWindow = window !== 'total';

    const query = `
        SELECT
            DATE_TRUNC('${interval}', created_at) AS period,
            COUNT(DISTINCT customer_id) AS unique_customers
        FROM orders
        WHERE vendor_id = $1
        ${hasWindow ? `AND created_at >= NOW() - INTERVAL '${window}'` : ''}
        GROUP BY period
        ORDER BY period;
    `;

    const result = await pool.query(query, [vendor_id]);

    return result.rows

    
}
// thats it for now. db needs to be updated to call customer reveiws, and likes /dislikes for items
export const getItems = async (
    vendor_id : string
) => {

    const query = `
         SELECT
            mi.id,
            mi.name,

            COALESCE(SUM(
                CASE
                    WHEN o.created_at >= NOW() - INTERVAL '7 days'
                    THEN oi.quantity
                    ELSE 0
                END
            ), 0) AS "weeklyOrders",

            COALESCE(SUM(
                CASE
                    WHEN o.created_at >= NOW() - INTERVAL '30 days'
                    THEN oi.quantity
                    ELSE 0
                END
            ), 0) AS "monthlyOrders",

            COALESCE(SUM(
                CASE
                    WHEN o.created_at >= NOW() - INTERVAL '7 days'
                    THEN oi.quantity * oi.price_paid
                    ELSE 0
                END
            ), 0) AS "weeklyRevenue",

            COALESCE(SUM(
                CASE
                    WHEN o.created_at >= NOW() - INTERVAL '30 days'
                    THEN oi.quantity * oi.price_paid
                    ELSE 0
                END
            ), 0) AS "monthlyRevenue"

        FROM menu_items mi

        LEFT JOIN order_items oi
            ON mi.id = oi.menu_item_id

        LEFT JOIN orders o
            ON oi.order_id = o.id

        WHERE mi.vendor_id = $1

        GROUP BY mi.id, mi.name

        ORDER BY "monthlyRevenue" DESC;

    `;

    const result = await pool.query(query, [vendor_id]);

    return result.rows

    
}