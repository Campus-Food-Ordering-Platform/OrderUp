// controller only accesses HTTP from user
// relies on service

import { Request, Response } from 'express';
import * as AnalyticsService from './analytics.service';
import { Parser } from 'json2csv';
//import PDFDocument from 'pdfkit'; I haven't quite figured out how to do the pdf export

export const exportRevenueCSV = async(req: Request, res: Response) => {
    try {
        const {vendor_id} = req.params as {vendor_id: string};
        const interval = (req.query.interval as string || 'day') as 'hour' | 'day' | 'week' | 'month' | 'year';

        const data = await AnalyticsService.getRevenueStats(vendor_id, interval);
        const parser = new Parser({ fields: ['period', 'revenue'] });
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
        res.send(csv);      
    } catch (error){
        res.status(500).json({message:'Export failed'});
    }
};


type Range = 'day' | 'week' | 'month' | '3 months' | '6 months' | 'year' | '2 days' | '14 days' | '2 months' | '12 months' | '2 years' | null;


const isValidRange = (value: any): value is Range => {
    return [
        'day',
        'week',
        'month',
        '3 months',
        '6 months',
        'year'
    ].includes(value);
};

// GET /analytics/orders/:vendor_id?range=week
export const getOrdersAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const vendor_id = req.params.vendor_id;

        if (!vendor_id || Array.isArray(vendor_id)) {
            return res.status(400).json({
                error: 'Invalid vendor_id'
            });
        }
        const { range } = req.query;

        if (!vendor_id) {
            return res.status(400).json({
                error: 'vendor_id is required'
            });
        }

        if (range && !isValidRange(range)) {
            return res.status(400).json({
                error: 'Invalid range value'
            });
        }

        const analytics =
            await AnalyticsService.getOrderInRange(
                vendor_id,
                (range as Range) || null
            );

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to fetch order analytics'
        });
    }
};

// GET /analytics/revenue/:vendor_id?range=month
export const getRevenueAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const vendor_id = req.params.vendor_id;
        if (!vendor_id || Array.isArray(vendor_id)) {
            return res.status(400).json({
                error: 'Invalid vendor_iddddd' 
            });
        }        
        const { range } = req.query;

        if (!vendor_id) {
            return res.status(400).json({
                error: 'vendor_id is required'
            });
        }

        if (range && !isValidRange(range)) {
            return res.status(400).json({
                error: 'Invalid range value'
            });
        }

        const analytics =
            await AnalyticsService.getRevenueInRange(
                vendor_id,
                (range as Range) || null
            );

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to fetch revenue analytics'
        });
    }
};

// GET /analytics/customers/:vendor_id?range=6months
export const getCustomerAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const vendor_id = req.params.vendor_id;

        if (!vendor_id || Array.isArray(vendor_id)) {
            return res.status(400).json({
                error: 'Invalid vendor_id' 
            });
        }
        const { range } = req.query;

        if (!vendor_id) {
            return res.status(400).json({
                error: 'vendor_id is required'
            });
        }

        if (range && !isValidRange(range)) {
            return res.status(400).json({
                error: 'Invalid range value'
            });
        }

        const analytics =
            await AnalyticsService.getCustomerInRange(
                vendor_id,
                (range as Range) || null
            );

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to fetch customer analytics'
        });
    }
};

// GET /analytics/items/:vendor_id?range=6months
export const getItemAnalytics = async (
    req: Request,
    res: Response
) => {
    try {
        const vendor_id = req.params.vendor_id;

        if (!vendor_id || Array.isArray(vendor_id)) {
            return res.status(400).json({
                error: 'Invalid vendor_id' 
            });
        }
        const { range } = req.query;

        if (!vendor_id) {
            return res.status(400).json({
                error: 'vendor_id is required'
            });
        }

        if (range && !isValidRange(range)) {
            return res.status(400).json({
                error: 'Invalid range value'
            });
        }

        const analytics =
            await AnalyticsService.getItems(
                vendor_id,
                (range as Range) || null
            );

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to fetch item analytics'
        });
    }
};

export const getVendorAnalytics = async (    
    req: Request,
    res: Response
) => {
        const vendor_id = req.params.vendor_id;
        if (!vendor_id || Array.isArray(vendor_id)) {
            return res.status(400).json({
                error: 'Invalid vendor_iddddd' 
            });
        }        
        const { range } = req.query;

        if (!vendor_id) {
            return res.status(400).json({
                error: 'vendor_id is required'
            });
        }

        if (range && !isValidRange(range)) {
            return res.status(400).json({
                error: 'Invalid range value'
            });
        }

   
    const rangeConfig = AnalyticsService.getRangeConfig(range as Range);
    const previousWindow = AnalyticsService.getPreviousWindow(range as Range);

    const [ordersSeries, revenueSeries, customersSeries, items] =
    await Promise.all([
        AnalyticsService.getOrderInRange(vendor_id, range as Range),
        AnalyticsService.getRevenueInRange(vendor_id, range as Range),
        AnalyticsService.getCustomerInRange(vendor_id, range as Range),
        AnalyticsService.getItems(vendor_id),

        // AnalyticsService.getRevenueSummary(vendor_id, previousWindow),
        // AnalyticsService.getOrderSummary(vendor_id, previousWindow),
        // AnalyticsService.getCustomerSummary(vendor_id, previousWindow),
    ]);
    const [
        currRevenue,
        currOrders,
        currCustomers,
        prevRevenue,
        prevOrders,
        prevCustomers
    ] = await Promise.all([
        AnalyticsService.getRevenueSummary(vendor_id, range as Range),
        AnalyticsService.getOrderSummary(vendor_id, range as Range),
        AnalyticsService.getCustomerSummary(vendor_id, range as Range),

        AnalyticsService.getRevenueSummary(vendor_id, previousWindow),
        AnalyticsService.getOrderSummary(vendor_id, previousWindow),
        AnalyticsService.getCustomerSummary(vendor_id, previousWindow),
    ]);



    return res.json({
    success: true,
    data: {
        orders: ordersSeries,
        revenue: revenueSeries,
        customers: customersSeries,
        items,

        kpis: {
        revenue: { current: currRevenue, previous: prevRevenue },
        orders: { current: currOrders, previous: prevOrders },
        customers: { current: currCustomers, previous: prevCustomers },
        }
    }
    });

  
};


export const getItemTimeSeries = async (req: Request, res: Response) => {
  try {
    const vendor_id = req.params.vendor_id as string;
    if (!vendor_id) return res.status(400).json({ error: 'Invalid vendor_id' });
    const data = await AnalyticsService.getItemTimeSeries(vendor_id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch item time series' });
  }
};