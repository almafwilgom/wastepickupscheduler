/* Service Worker for Waste Pickup Scheduler PWA & Mobile Heads-Up Phone Bar Push Notifications */

const CACHE_NAME = 'wps-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Mobile Push Notification Event Handler (Heads-up Phone Status Bar Banner)
self.addEventListener('push', (event) => {
  let data = { 
    title: '🚛 Waste Pickup Scheduler', 
    message: 'You have a new update regarding your waste pickup.' 
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message || data.body || 'New status update received',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.id ? 'wps-alert-' + data.id : 'wps-single-alert',
    renotify: true,
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    data: { url: data.url || '/#dashboard' },
    actions: [
      { action: 'open', title: 'Open Dashboard' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title || '🚛 Waste Pickup Scheduler', options));
});

// Handle Notification Click on Mobile & Desktop status bar
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
