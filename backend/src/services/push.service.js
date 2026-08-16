import webpush from 'web-push';
import { User } from '../models/User.js';

// VAPID keys for Web Push Service
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-m3A1O8M4H3Hw4H9q0xH9Q2wK2E4R2Y2U2I2O2P2L2K2J2H2G2F2D2S2A';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'vK3F3D3S3A3Z3X3C3V3B3N3M3K3J3H3G3F3D3S3A';

try {
  webpush.setVapidDetails(
    'mailto:admin@wastepickupscheduler.com',
    publicVapidKey,
    privateVapidKey
  );
} catch (err) {
  console.warn('[Push Service] VAPID initialization warning:', err.message);
}

export async function sendWebPushNotification(userId, payloadData) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: payloadData.title || '🚛 Waste Pickup Scheduler',
      body: payloadData.message || payloadData.body || 'You have a new waste pickup status update.',
      icon: '/logo.png',
      badge: '/logo.png',
      url: payloadData.url || '/#dashboard',
      id: payloadData.id || Date.now(),
    });

    const activeSubscriptions = [];
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        activeSubscriptions.push(sub);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or invalid
          console.log('[Push Service] Expired subscription removed:', sub.endpoint);
        } else {
          console.warn('[Push Service] Web push send error:', err.message);
          activeSubscriptions.push(sub);
        }
      }
    }

    if (activeSubscriptions.length !== user.pushSubscriptions.length) {
      user.pushSubscriptions = activeSubscriptions;
      await user.save();
    }
  } catch (err) {
    console.error('[Push Service] Error sending push notification:', err.message);
  }
}
