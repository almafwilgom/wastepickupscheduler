/**
 * Mobile & Desktop Push Notification Helper
 * Delivers WhatsApp-style heads-up status bar notifications with deduplication.
 */

let swRegistration = null;

export async function requestPushNotificationPermission() {
  if (typeof window === 'undefined') return;

  // Register Service Worker for Mobile Push Support
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Service worker registered successfully:', swRegistration.scope);
    } catch (err) {
      console.warn('[SW] Service worker registration warning:', err);
    }
  }

  // Request Notification permission
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('[Push] Notification permission granted.');
        }
      } catch (err) {
        console.warn('[Push] Notification permission request error:', err);
      }
    }
  }
}

export async function triggerPushNotification(title, message, notificationId = null, icon = '/logo.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    return;
  }

  const tagId = notificationId ? `wps-alert-${notificationId}` : 'wps-single-alert';

  const options = {
    body: message,
    icon: icon,
    badge: icon,
    vibrate: [300, 100, 300, 100, 300],
    tag: tagId,
    renotify: true,
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    data: { url: '/#dashboard' },
  };

  try {
    // 1. Try Service Worker push notification (Required for Mobile Android/iOS Heads-up Status Bar Banner)
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    }

    // 2. Desktop Fallback
    const notification = new Notification(title, options);
    notification.onclick = function () {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('[Push] Trigger error:', err);
  }
}
