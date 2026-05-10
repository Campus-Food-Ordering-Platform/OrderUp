
console.log("ANALYTICS ROUTE FILE LOADED");


import { Router } from "express";
import * as analyticsController from "./analytics.controller";

const router = Router();

/**
 * Revenue analytics for a vendor
 * GET /analytics/revenue/:vendor_id?range=month
 */
router.get("/revenue/:vendor_id", analyticsController.getRevenueAnalytics);

/**
 * Orders analytics for a vendor
 * GET /analytics/orders/:vendorId?range=month
 */
router.get("/orders/:vendor_id", analyticsController.getOrdersAnalytics);

/**
 * Customer analytics for a vendor
 * GET /analytics/customers/:vendorId?range=month
 */
router.get("/customers/:vendor_id", analyticsController.getCustomerAnalytics);

/**
 * item analytics for a vendor
 * GET /analytics/items/:vendorId?range=month
 */
router.get("/items/:vendor_id", analyticsController.getItemAnalytics);

router.get("/graph/:vendor_id", analyticsController.getVendorAnalytics);


router.get('/:vendor_id/revenue/export/csv', analyticsController.exportRevenueCSV);



export default router;