// ── subscribeToPush.ts ───────────────────────────────────────────────────────
// Registers the browser's service worker and subscribes the student to
// web push notifications. Call this once after the student logs in.
//
// The flow:
//   1. Check browser supports push
//   2. Ask user for notification permission
//   3. Register sw.js as a service worker
//   4. Subscribe to push via PushManager (uses your VAPID public key)
//   5. POST the subscription object to your backend to be saved in DB
// ────────────────────────────────────────────────────────────────────────────

// Your VAPID public key — generated once via: npx web-push generate-vapid-keys
// Stored in frontend .env as VITE_VAPID_PUBLIC_KEY (public key only, never private)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

// The browser's PushManager.subscribe() requires the VAPID public key as a
// Uint8Array, but it's stored as a base64 URL-encoded string in .env.
// This function converts it to the correct format.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Add padding characters if the string length isn't a multiple of 4
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

  // Convert from base64url encoding (- and _) to standard base64 (+ and /)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Decode the base64 string and convert each character to its char code
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export async function subscribeToPush(customerId: string): Promise<void> {
  // ── Step 1: Check browser support ─────────────────────────────────────────
  // Push is not supported in all browsers.
  // Notably: iOS Safari only supports it if the app is installed as a PWA.
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported in this browser');
    return;
  }

  // ── Step 2: Request notification permission ────────────────────────────────
  // This shows the browser's "Allow notifications?" prompt.
  // The browser remembers the answer — it won't prompt again unless reset.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Permission denied by user');
    return;
  }

  // ── Step 3: Register the service worker ───────────────────────────────────
  // sw.js must be in /public so it's served from the root of your domain.
  // Calling register() multiple times is safe — the browser deduplicates it.
  const registration = await navigator.serviceWorker.register('/sw.js');

  // Wait for the service worker to be ready before subscribing
  await navigator.serviceWorker.ready;

  // ── Step 4: Subscribe to push notifications ────────────────────────────────
  // Check if a subscription already exists for this device first.
  // This prevents creating duplicate rows in your push_subscriptions table
  // if subscribeToPush() is called more than once (e.g. on every login).
  const existingSubscription = await registration.pushManager.getSubscription();

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      // userVisibleOnly: true is required by all browsers.
      // It means every push event MUST show a visible notification to the user.
      userVisibleOnly: true,

      // The VAPID public key identifies your server to the push service.
      // Cast to BufferSource to satisfy TypeScript's strict type checking.
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    }));

  // ── Step 5: Save the subscription to your backend ─────────────────────────
  // The subscription object contains:
  //   - endpoint: the push service URL specific to this browser/device
  //   - keys: encryption keys so only your server can send to this endpoint
  //
  // Your backend saves this against the customer's profile so it can look
  // it up later when an order status changes and a notification needs to fire.
  await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId, // Auth0 ID — backend resolves to internal UUID
      subscription,            // the full PushSubscription object
    }),
  });

  console.log('[Push] Subscribed successfully');
}