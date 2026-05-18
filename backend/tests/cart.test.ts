import { Request, Response } from "express";

jest.mock("../src/modules/cart/cart.service", () => ({
  addItemToCart: jest.fn(),
  removeItemFromCart: jest.fn(),
  getCart: jest.fn(),
}));

import * as controller from "../src/modules/cart/cart.controller";
import * as service from "../src/modules/cart/cart.service";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Cart Controller", () => {

  describe("addItem", () => {
    it("should add item and return 200 with item", async () => {
      const req = { body: { userId: 1, itemId: 2 } } as Request;
      const res = mockRes();
      const fakeItem = { id: 1, user_id: 1, menu_item_id: 2, quantity: 1 };
      (service.addItemToCart as jest.Mock).mockResolvedValue(fakeItem);
      await controller.addItem(req, res);
      expect(service.addItemToCart).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith(fakeItem);
    });

    it("should return 400 if userId is missing", async () => {
      const req = { body: { itemId: 2 } } as Request;
      const res = mockRes();
      await controller.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing userId or itemId" });
    });

    it("should return 400 if itemId is missing", async () => {
      const req = { body: { userId: 1 } } as Request;
      const res = mockRes();
      await controller.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing userId or itemId" });
    });

    it("should return 500 if service throws", async () => {
      const req = { body: { userId: 1, itemId: 2 } } as Request;
      const res = mockRes();
      (service.addItemToCart as jest.Mock).mockRejectedValue(new Error("DB error"));
      await controller.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to add item" });
    });
  });

  describe("removeItem", () => {
    it("should remove item and return result", async () => {
      const req = { body: { userId: 1, itemId: 2 } } as Request;
      const res = mockRes();
      const fakeItem = { id: 1, user_id: 1, menu_item_id: 2, quantity: 1 };
      (service.removeItemFromCart as jest.Mock).mockResolvedValue(fakeItem);
      await controller.removeItem(req, res);
      expect(service.removeItemFromCart).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith(fakeItem);
    });

    it("should return empty object if item not found", async () => {
      const req = { body: { userId: 1, itemId: 2 } } as Request;
      const res = mockRes();
      (service.removeItemFromCart as jest.Mock).mockResolvedValue(null);
      await controller.removeItem(req, res);
      expect(res.json).toHaveBeenCalledWith({});
    });

    it("should return 400 if userId is missing", async () => {
      const req = { body: { itemId: 2 } } as Request;
      const res = mockRes();
      await controller.removeItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing userId or itemId" });
    });

    it("should return 400 if itemId is missing", async () => {
      const req = { body: { userId: 1 } } as Request;
      const res = mockRes();
      await controller.removeItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing userId or itemId" });
    });

    it("should return 500 if service throws", async () => {
      const req = { body: { userId: 1, itemId: 2 } } as Request;
      const res = mockRes();
      (service.removeItemFromCart as jest.Mock).mockRejectedValue(new Error("DB error"));
      await controller.removeItem(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to remove item" });
    });
  });

  describe("getUserCart", () => {
    it("should return cart for user", async () => {
      const req = { params: { userId: "1" } } as unknown as Request;
      const res = mockRes();
      const fakeCart = [{ id: 1, user_id: 1, menu_item_id: 2, quantity: 1, name: "Burger", price: 50, vendor_id: 3 }];
      (service.getCart as jest.Mock).mockResolvedValue(fakeCart);
      await controller.getUserCart(req, res);
      expect(service.getCart).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(fakeCart);
    });

    it("should return 500 if service throws", async () => {
      const req = { params: { userId: "1" } } as unknown as Request;
      const res = mockRes();
      (service.getCart as jest.Mock).mockRejectedValue(new Error("DB error"));
      await controller.getUserCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch cart" });
    });
  });
});