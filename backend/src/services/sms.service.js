/**
 * Termii WhatsApp & SMS Integration Service for Waste Pickup Scheduler
 * Sends instant WhatsApp & SMS alerts to residents when collectors are on the way.
 */

export async function sendWhatsAppSMS(phone, message) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'WastePickup';
  const channel = process.env.TERMII_CHANNEL || 'whatsapp';

  if (!apiKey) {
    console.warn('[WhatsApp/SMS Service Warning] TERMII_API_KEY is not configured. Direct alert notification skipped.');
    return { success: false, message: 'API key missing in server environment' };
  }

  if (!phone) {
    console.warn('[WhatsApp/SMS Service Warning] Cannot send message: No phone number provided.');
    return { success: false, message: 'Recipient phone number is missing' };
  }

  // Format phone number (e.g. 080... to 23480...)
  let formattedPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.slice(1);
  }

  const payload = {
    to: formattedPhone,
    from: senderId,
    sms: message,
    type: 'plain',
    channel: channel, // 'whatsapp' or 'generic'
    api_key: apiKey,
  };

  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && (data.code === 'ok' || data.message_id)) {
      console.log(`[WhatsApp/SMS Service Success] Alert delivered via ${channel} to ${formattedPhone}`);
      return { success: true, data };
    } else {
      console.warn(`[WhatsApp/SMS Service Fallback] Termii ${channel} response:`, data.message || data);
      // Fallback attempt with generic channel if whatsapp channel returns non-ok
      if (channel === 'whatsapp') {
        payload.channel = 'generic';
        const fallbackRes = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          return { success: true, data: fallbackData };
        }
      }
      return { success: false, message: data.message || 'Failed to send WhatsApp/SMS via Termii' };
    }
  } catch (error) {
    console.error('[WhatsApp/SMS Service Error] HTTP exception during dispatch:', error.message);
    return { success: false, message: error.message };
  }
}

// Alias for backward compatibility
export const sendSMS = sendWhatsAppSMS;

export function getWhatsAppDirectLink(phone, message) {
  if (!phone) return '#';
  let formattedPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.slice(1);
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
