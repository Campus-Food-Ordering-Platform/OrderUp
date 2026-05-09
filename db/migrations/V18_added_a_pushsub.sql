CREATE TABLE push_subscriptions (
  id              SERIAL PRIMARY KEY,
  customer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription    JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id, subscription)
);
-- push_subscriptions table
-- 
-- When a student grants notification permission in their browser, the browser
-- generates a unique subscription object containing:
--   - endpoint: a URL on Google/Mozilla's push servers specific to that browser/device
--   - keys: encryption keys so only your server can send to that endpoint
--
-- Your server has no way of knowing this endpoint unless the browser tells it.
-- That's why when a student logs in, the frontend calls POST /api/push/subscribe
-- which saves this object here against their profile.
--
-- Later, when a vendor advances an order status (received → preparing → ready),
-- the server looks up the student's subscription from this table and uses it
-- to send a push notification through Google/Mozilla's push service.
--
-- Without this table, the server would have no way to reach the student's device.
-- Think of it like storing an email address — Google delivers the email,
-- but you still need to store the address yourself to know where to send it.
--
-- One student can have multiple rows here (phone + laptop = 2 subscriptions).
-- The UNIQUE constraint prevents duplicate subscriptions for the same device.
