import * as repo from "./cart.repo";

export const addItemToCart = async (userId: number, itemId: number) => {
  const existing = await repo.findCartItem(userId, itemId);

  if (existing) {
    return repo.incrementCartItem(userId, itemId);
  }

  return repo.insertCartItem(userId, itemId);
};

export const removeItemFromCart = async (userId: number, itemId: number) => {
  const existing = await repo.findCartItem(userId, itemId);

  if (!existing) return null;

  if (existing.quantity <= 1) {
    await repo.deleteCartItem(userId, itemId);
    return null;
  }

  return repo.decrementCartItem(userId, itemId);
};

export const getCart = async (userId: number) => {
  return repo.getCartItems(userId);
};