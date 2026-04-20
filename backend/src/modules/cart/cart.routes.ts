import express from "express";
import { addItem, removeItem, getUserCart } from "./cart.controller";

const router = express.Router();

router.post("/add", addItem);
router.post("/remove", removeItem);
router.get("/:userId", getUserCart);

export default router;