/* Service Worker for Waste Pickup Scheduler PWA & Mobile Push Notifications */

const CACHE_NAME = 'wps-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Mobile Push Notification Event Handler
self.addEventListener('push', (event) => {
  let data = { title: '🚛 Waste Pickup Notification', message: 'You have a new update regarding your waste pickup.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message || data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/#dashboard' },
    actions: [{ action: 'open', title: 'View Dashboard' }],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click on Mobile & Desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/#dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
