import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,        // keep your existing env var name
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  subscription: string | object,
  payload: { title: string; body: string; url?: string }
) {
  // Handle both raw JSON string (as stored in DB) and already-parsed object
  const parsedSubscription = typeof subscription === 'string'
    ? JSON.parse(subscription)
    : subscription;

  // Do NOT catch here — let the error bubble up to order.service.ts
  // so it can detect expired subscriptions (410/404) and clean them up
  await webpush.sendNotification(
    parsedSubscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? '/',
    })
  );
}