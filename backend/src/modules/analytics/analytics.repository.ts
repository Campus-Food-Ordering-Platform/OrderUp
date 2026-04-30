// repositry can only access database

// First we want to get an analytic. 
// only issue is whether we want it monthly, weekly, daily or yearly etc 
// this can be controlled using the sql query and multiple get functions 
// or we can just extracted the data raw and send it to the analytics.service to process 
// which is better?
// extract raw data to process later is better

// lets start easy with:
// number of orders made
// this requires a function from the vendor.repository file
import * as vendorRepo from '../vendors/vendor.repository';
// pool must also be imported:
import pool from '../../config/db';
// A pool is a set of pre-created database connections that our backend reuses instead of opening a new connection every time.
// pool can be found in backend/src/config/db.ts
// getOrderAmount function below
export const getOrderAmount = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'
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





 