const express = require('express');
const router = express.Router();
const { chat } = require('../services/ai-agent');
const { sendMessage } = require('../services/twilio');
const supabase = require('../services/supabase');

// Twilio sends POST to /webhook/twilio when a message arrives
router.post('/twilio', async (req, res) => {
  // Twilio sends form-encoded data
  const from = req.body.From || '';
  const body = req.body.Body || '';

  // Extract plain phone number from "whatsapp:+91XXXXXXXX" or "+91XXXXXXXX"
  const phone = from.replace('whatsapp:', '').trim();

  console.log(`[Webhook] Message from ${phone}: ${body}`);

  // Acknowledge Twilio immediately (must reply within 15s)
  res.type('text/xml').send('<Response></Response>');

  if (!phone || !body) return;

  try {
    // Upsert contact in leads table if new
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .single();

    if (!existingLead) {
      await supabase.from('leads').insert({
        phone,
        status: 'new',
        created_at: new Date().toISOString(),
      });
    }

    // Get AI response
    const { message, actions } = await chat(phone, body);

    // Send reply
    await sendMessage(phone, message);

    // Log actions taken
    if (actions.length > 0) {
      console.log(`[Webhook] Actions from AI:`, actions);
    }
  } catch (err) {
    console.error('[Webhook] Error processing message:', err.message);
    // Send fallback message
    await sendMessage(
      phone,
      `Thanks for reaching out to ${process.env.GYM_NAME}! We'll get back to you shortly. 💪`
    );
  }
});

// Test endpoint — simulate a message without Twilio
router.post('/test', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  try {
    const result = await chat(phone, message);
    res.json({ success: true, reply: result.message, actions: result.actions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
