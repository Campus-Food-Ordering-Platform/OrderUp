ALTER TABLE push_subscriptions 
DROP CONSTRAINT push_subscriptions_customer_id_subscription_key;

ALTER TABLE push_subscriptions 
ADD CONSTRAINT push_subscriptions_customer_id_key UNIQUE (customer_id);
-- Replaced composite UNIQUE (customer_id, subscription) with a single-column
-- UNIQUE on customer_id. This ensures one push subscription per student
-- (one device per account), and allows ON CONFLICT (customer_id) DO UPDATE
-- to correctly overwrite a stale subscription when a student re-subscribes
-- from a new browser or device instead of inserting a duplicate row.