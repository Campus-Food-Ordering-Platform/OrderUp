import { Request, Response } from 'express';
// Import types for request and response objects from Express

import {
    addMenuItem,
    getMenuItemsByVendor,
    deleteMenuItem,
    updateMenuItem
} from './menu.service';
// Import service functions that handle the business logic and database interaction


// Create a new menu item
export const createMenuItem = async (req: Request, res: Response) => {
    try {
        // Extract data sent from the frontend (request body)
        const { vendorId, name, description, price, image_url } = req.body;

        // Call service function to insert item into database
        const item = await addMenuItem(vendorId, name, description, price, image_url);

        // Send back created item with HTTP 201 (Created)
        res.status(201).json(item);
    } catch (err: any) {
        // If something goes wrong, return server error
        res.status(500).json({ error: err.message });
    }
};


// Get all menu items for a specific vendor
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        if (!vendorId) {
            res.status(400).json({ error: 'Vendor ID is required' });
            return;
        }
        const items = await getMenuItemsByVendor(vendorId.toString());
        res.json(items);
    } catch (err: any) {
        res.status(500).json({ error: err.message });// this line handles errors
    }
};


// Delete a menu item by its ID
export const removeMenuItem = async (req: Request, res: Response) => {
    try {
        // Extract itemId from URL parameters
        const itemId = req.params.itemId as string;// btw we have to specify it a string as typescript dont know the path. also i asked my self why we can use itemId instead of id which is in the database it simply because it a variable (maybe i dont like the name in the database )

        // Call service to delete the item
        await deleteMenuItem(itemId);

        // Return 204 (No Content) to indicate successful deletion
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};


// Update an existing menu item
export const modifyMenuItem = async (req: Request, res: Response) => {
    try {
        // Extract itemId from URL parameters
        const itemId  = req.params.itemId as string;

        // Extract updated fields from request body
        const { name, description, price, image_url } = req.body;

        // Call service to update the item in the database
        const item = await updateMenuItem(itemId, name, description, price, image_url);

        // Return the updated item
        res.json(item);
    } catch (err: any) {
        // Handle errors
        res.status(500).json({ error: err.message });
    }
};