import webpush from 'web-push';
import { User } from '../models/User.js';

// VAPID keys for Web Push Service (real keys in .env)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BCe7YzXRpyHCuG9HO_Jo-tB-AXsCtgWZxi7Ae-3o88nGxaoS4rxH11EO2KUNc8muNLxr9hWiyBxcNPUcExbJ0io';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'i4BwahkkXq7Gi07yVvaeoposH7FgQ9E7B7RycgWXajA';

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
      console.log('[Push Service] No push subscriptions for user:', userId);
      return;
    }

    const payload = JSON.stringify({
      title: payloadData.title || '🚛 Waste Pickup Scheduler',
      message: payloadData.message || payloadData.body || 'You have a new waste pickup status update.',
      body: payloadData.message || payloadData.body || 'You have a new waste pickup status update.',
      icon: '/logo.png',
      badge: '/logo.png',
      url: payloadData.url || '/#dashboard',
      id: payloadData.id ? String(payloadData.id) : String(Date.now()),
    });

    const activeSubscriptions = [];
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        activeSubscriptions.push(sub);
        console.log('[Push Service] ✅ Sent push to:', sub.endpoint?.slice(0, 60));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or invalid – drop it silently
          console.log('[Push Service] Expired subscription removed:', sub.endpoint?.slice(0, 60));
        } else {
          console.warn('[Push Service] Web push send error:', err.message);
          activeSubscriptions.push(sub); // keep it, might be transient
        }
      }
    }

    // Persist cleaned subscription list
    if (activeSubscriptions.length !== user.pushSubscriptions.length) {
      user.pushSubscriptions = activeSubscriptions;
      await user.save();
    }
  } catch (err) {
    console.error('[Push Service] Error sending push notification:', err.message);
  }
}
