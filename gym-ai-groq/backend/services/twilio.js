const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const useWhatsApp = process.env.TWILIO_USE_WHATSAPP === 'true';

function formatNumber(phone) {
  // Ensure phone starts with +
  const clean = phone.replace(/\D/g, '');
  const withPlus = phone.startsWith('+') ? phone : `+${clean}`;
  return useWhatsApp ? `whatsapp:${withPlus}` : withPlus;
}

async function sendMessage(to, body) {
  try {
    const from = useWhatsApp
      ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`
      : process.env.TWILIO_PHONE_NUMBER;

    const message = await client.messages.create({
      body,
      from,
      to: formatNumber(to),
    });

    console.log(`[Twilio] Message sent to ${to}: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error(`[Twilio] Error sending to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// Send bulk messages
async function sendBulk(recipients, body) {
  const results = [];
  for (const phone of recipients) {
    const result = await sendMessage(phone, body);
    results.push({ phone, ...result });
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

module.exports = { sendMessage, sendBulk };
