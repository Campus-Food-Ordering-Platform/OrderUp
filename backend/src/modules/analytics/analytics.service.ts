// service is coding logic
// relies on repo
import * as analyticsRepo from './analytics.repository'; //pulls all exported methods from the analytics.repository

// The requirements we need to report Sales, peak ordering hrs and a custom view, I was thinking Highest selling items
// The getRevenueTotal func in the repository satisfies the 1st view req


/*
The methods in this file take the "raw" database rows it and formats and parses them before they are sent to the controller
*/
export const getRevenueStats = async (                                      
    vendor_id: string,
    interval:  'hour' | 'day' | 'week' | 'month' | 'year'
) => {
    const rows = await analyticsRepo.getRevenueTotal(vendor_id,interval);
    return rows.map(row => ({
        period: row.period,
        revenue: parseFloat(row.revenue), 
    }));
};
