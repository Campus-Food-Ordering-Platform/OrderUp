// controller only accesses HTTP from user
// relies on service

import { Request, Response } from 'express';
import * as AnalyticsService from './analytics.service';

type Range =
    | 'day'
    | 'week'
    | 'month'
    | '3months'
    | '6months'
    | 'year';

const isValidRange = (value: any): value is Range => {
    return [
        'day',
        'week',
        'month',
        '3months',
        '6months',
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
        }        const { range } = req.query;

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