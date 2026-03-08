const Groq = require('groq-sdk');
const supabase = require('./supabase');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Model config ─────────────────────────────────────────────────────
// Free tier options on Groq (all extremely fast):
//   llama-3.3-70b-versatile   — best quality, great for sales conversations
//   llama-3.1-8b-instant      — fastest, lightest (good for simple FAQs)
//   mixtral-8x7b-32768        — great for long conversation context
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ─── System prompt ────────────────────────────────────────────────────
const buildSystemPrompt = () => `You are an AI assistant for ${process.env.GYM_NAME || 'FitZone Gym'}.
You help customers with:
- Membership enquiries and pricing
- Booking classes and personal training sessions
- Answering questions about gym facilities
- Collecting lead information (name, goal, phone)
- Membership renewal reminders

Gym Details:
- Name: ${process.env.GYM_NAME || 'FitZone Gym'}
- Address: ${process.env.GYM_ADDRESS || '123 Main Street'}
- Timings: ${process.env.GYM_TIMINGS || 'Mon-Sat 6AM-10PM, Sun 7AM-8PM'}
- Plans:
    Basic    Rs.${process.env.PLAN_BASIC    || 999}/month  — Full gym access
    Standard Rs.${process.env.PLAN_STANDARD || 1499}/month — Gym + 2 group classes/week
    Premium  Rs.${process.env.PLAN_PREMIUM  || 2499}/month — Unlimited classes + 2 PT sessions/month

Personality: Friendly, energetic, motivating. Use fitness emojis. Keep responses SHORT — max 3 sentences for WhatsApp. Never write long paragraphs.

Lead Collection Flow:
1. Greet and ask for fitness goal
2. Ask for name
3. Ask preferred timing / budget
4. Offer free trial and confirm phone if not known

Booking Flow:
1. Ask what they want to book (class type / PT session)
2. Suggest slots: Mon/Wed/Fri 7AM and 6PM | Tue/Thu/Sat 8AM and 7PM
3. Confirm booking and tell them they will get a reminder

COMMANDS — append silently at end of your message when conditions are met:
- When you have name + phone + goal + booking time: append BOOKING_COMPLETE: [name] | [phone] | [goal] | [datetime]
- When you have name + phone + goal only: append LEAD_CAPTURED: [name] | [phone] | [goal]

Always end with a clear next step or question. Be conversion-focused.`;

// ─── Get conversation history ─────────────────────────────────────────
async function getHistory(phone) {
  const { data } = await supabase
    .from('conversations')
    .select('role, message')
    .eq('phone', phone)
    .order('created_at', { ascending: true })
    .limit(20);

  return (data || []).map(row => ({
    role: row.role,
    content: row.message,
  }));
}

// ─── Save a message ───────────────────────────────────────────────────
async function saveMessage(phone, role, message) {
  await supabase.from('conversations').insert({
    phone,
    role,
    message,
    created_at: new Date().toISOString(),
  });
}

// ─── Parse AI commands embedded in response ───────────────────────────
async function parseCommands(text, phone) {
  const actions = [];

  if (text.includes('BOOKING_COMPLETE:')) {
    const raw = text.split('BOOKING_COMPLETE:')[1].split('\n')[0].trim();
    const parts = raw.split('|').map(p => p.trim());
    const [name, leadPhone, goal, datetime] = parts;

    actions.push({ type: 'booking_complete', name, phone: leadPhone || phone, goal, datetime });

    await supabase.from('bookings').insert({
      phone: leadPhone || phone,
      summary: `${name} — ${goal} — ${datetime}`,
      status: 'confirmed',
      class_type: goal,
      created_at: new Date().toISOString(),
    });

    await supabase.from('leads').upsert({
      name, phone: leadPhone || phone, goal,
      status: 'trial_booked',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'phone' });
  }

  if (text.includes('LEAD_CAPTURED:')) {
    const raw = text.split('LEAD_CAPTURED:')[1].split('\n')[0].trim();
    const parts = raw.split('|').map(p => p.trim());
    const [name, leadPhone, goal] = parts;

    actions.push({ type: 'lead_captured', name, phone: leadPhone || phone, goal });

    await supabase.from('leads').upsert({
      name, phone: leadPhone || phone, goal,
      status: 'qualified',
      created_at: new Date().toISOString(),
    }, { onConflict: 'phone' });
  }

  return actions;
}

// ─── Strip command markers before sending to user ─────────────────────
function cleanText(text) {
  return text
    .replace(/BOOKING_COMPLETE:.*$/gm, '')
    .replace(/LEAD_CAPTURED:.*$/gm, '')
    .trim();
}

// ─── Main chat function ───────────────────────────────────────────────
async function chat(phone, userMessage) {
  try {
    await saveMessage(phone, 'user', userMessage);

    const history = await getHistory(phone);

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
      ],
    });

    const aiText = response.choices[0].message.content;
    const actions = await parseCommands(aiText, phone);
    const reply = cleanText(aiText);

    await saveMessage(phone, 'assistant', reply);

    console.log(`[Groq] model=${MODEL} tokens=${response.usage?.total_tokens} phone=${phone}`);

    return { message: reply, actions, model: MODEL, usage: response.usage };
  } catch (err) {
    console.error('[Groq AI] Error:', err.message);
    throw err;
  }
}

// ─── Generate reminder messages ───────────────────────────────────────
async function generateReminder(type, memberData) {
  const prompts = {
    expiry: `Write a short friendly WhatsApp message (max 2 sentences) for gym member ${memberData.name} whose membership expires in ${memberData.daysLeft} days at ${process.env.GYM_NAME}. Include placeholder [RENEWAL_LINK].`,
    inactive: `Write a short re-engagement WhatsApp message (max 2 sentences) for gym member ${memberData.name} who hasn't visited in ${memberData.daysInactive} days at ${process.env.GYM_NAME}. Be encouraging.`,
    class_reminder: `Write a short class reminder WhatsApp (max 2 sentences) for ${memberData.name}. Class: ${memberData.className} at ${memberData.time} at ${process.env.GYM_NAME}.`,
    review_request: `Write a short Google review request WhatsApp (max 2 sentences) for ${memberData.name} after their ${memberData.visitCount}th visit at ${process.env.GYM_NAME}. Include [REVIEW_LINK].`,
  };

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 150,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompts[type] }],
  });

  return response.choices[0].message.content.trim();
}

module.exports = { chat, generateReminder };
