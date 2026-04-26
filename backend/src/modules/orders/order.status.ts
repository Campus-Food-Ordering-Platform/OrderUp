export enum OrderStatus {
  Confirmed  = 'received',
  Preparing  = 'preparing',
  Ready      = 'ready',
  Collected  = 'collected',
};// (i know it dont match but i did not look at the database)its here to prevent any misspellings of order status in the codebase. Always use OrderStatus enum instead of hardcoding strings.

export const STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.Confirmed]: OrderStatus.Preparing,
  [OrderStatus.Preparing]: OrderStatus.Ready,
  [OrderStatus.Ready]:     OrderStatus.Collected,
};//this defines the allowed transitions between order statuses. For example, an order can only move from Confirmed to Preparing, not directly to Ready. This helps enforce a consistent order flow in the system.

