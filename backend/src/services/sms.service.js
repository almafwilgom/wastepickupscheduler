/**
 * Termii SMS Integration Service for Waste Pickup Scheduler
 * Sends SMS alerts to residents when collectors are on the way.
 */

export async function sendSMS(phone, message) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'WastePickup';

  if (!apiKey) {
    console.warn('[SMS Service Warning] TERMII_API_KEY is not configured in environment variables. SMS notification skipped.');
    return { success: false, message: 'SMS API key missing in server environment' };
  }

  if (!phone) {
    console.warn('[SMS Service Warning] Cannot send SMS: No phone number provided.');
    return { success: false, message: 'Recipient phone number is missing' };
  }

  // Format Nigerian phone number if needed (e.g. 080... to 23480...)
  let formattedPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.slice(1);
  }

  const payload = {
    to: formattedPhone,
    from: senderId,
    sms: message,
    type: 'plain',
    channel: 'generic',
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
      console.log(`[SMS Service Success] Notification sent to ${formattedPhone}`);
      return { success: true, data };
    } else {
      console.error('[SMS Service Error] Termii API error response:', data.message || data);
      return { success: false, message: data.message || 'Failed to send SMS via Termii' };
    }
  } catch (error) {
    console.error('[SMS Service Error] HTTP exception during SMS dispatch:', error.message);
    return { success: false, message: error.message };
  }
}
