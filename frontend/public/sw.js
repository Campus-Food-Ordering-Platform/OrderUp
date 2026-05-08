// Service Worker — handles incoming push notifications and notification clicks.
// This file MUST live at /public/sw.js so it's served from the root of your domain.
// If it's in a subfolder, the browser will refuse to register it.

self.addEventListener('push', (event) => {
  // Guard against empty push events (some browsers send empty pings)
  if (!event.data) return;

  const { title, body, url } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg', // small icon shown in the notification tray
      data: { url },           // stored so we can use it on click
    })
  );
});

// When the student taps the notification, open the app at the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it instead of opening a new tab
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(event.notification.data.url);
          return;
        }
      }
      // Otherwise open a new window
      clients.openWindow(event.notification.data.url);
    })
  );
});