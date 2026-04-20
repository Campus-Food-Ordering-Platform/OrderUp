import { Request, Response } from "express";
import * as service from "./cart.service";

export const addItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: "Missing userId or itemId" });
    }

    const item = await service.addItemToCart(userId, itemId);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: "Missing userId or itemId" });
    }

    const item = await service.removeItemFromCart(userId, itemId);
    res.json(item || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const cart = await service.getCart(userId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};