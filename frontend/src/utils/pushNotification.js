/**
 * Browser Push Notification Helper
 * Requests native browser permission and triggers push notifications.
 */

export function requestPushNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Browser push notification permission granted.');
        }
      });
    }
  }
}

export function triggerPushNotification(title, message, icon = '/logo.png') {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: icon,
          badge: icon,
          vibrate: [200, 100, 200],
          tag: 'wps-alert',
        });

        notification.onclick = function () {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Native notification trigger warning:', err);
      }
    }
  }
}
