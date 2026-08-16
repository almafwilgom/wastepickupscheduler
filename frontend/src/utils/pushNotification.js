/**
 * Mobile & Desktop Push Notification Helper
 * Handles Web Push subscription for lockscreen alerts on iOS Safari & Android Chrome.
 */

import { apiRequest } from '../services/api';

const VAPID_PUBLIC_KEY = 'BCe7YzXRpyHCuG9HO_Jo-tB-AXsCtgWZxi7Ae-3o88nGxaoS4rxH11EO2KUNc8muNLxr9hWiyBxcNPUcExbJ0io';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let swRegistration = null;

export async function requestPushNotificationPermission(userToken = null) {
  if (typeof window === 'undefined') return false;

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Registered scope:', swRegistration.scope);
    } catch (err) {
      console.warn('[SW] Registration warning:', err);
    }
  }

  if (!('Notification' in window)) {
    console.warn('[Push] Browser does not support Notifications');
    return false;
  }

  try {
    // Only call Notification.requestPermission() inside explicit user gesture handlers!
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('[Push] Notification permission granted.');

      // Subscribe to Web Push Manager for Lockscreen delivery
      if ('serviceWorker' in navigator && userToken) {
        const reg = swRegistration || (await navigator.serviceWorker.ready);
        if (reg && reg.pushManager) {
          try {
            const subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Send subscription payload to Express backend
            await apiRequest('/auth/subscribe-push', 'POST', subscription, userToken);
            console.log('[Push] Registered WebPush lockscreen subscription.');
          } catch (subErr) {
            console.warn('[Push] PushManager subscription warning:', subErr.message);
          }
        }
      }
      return true;
    }
  } catch (err) {
    console.warn('[Push] Permission request failed:', err);
  }

  return false;
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
    renotify: false,
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    data: { url: '/#dashboard' },
  };

  try {
    // Service Worker push notification for Mobile Android/iOS Heads-up Status Bar Banner
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    }

    // Desktop Fallback
    const notification = new Notification(title, options);
    notification.onclick = function () {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('[Push] Trigger error:', err);
  }
}
