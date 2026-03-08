const cron = require('node-cron');
const supabase = require('./supabase');
const { sendMessage } = require('./twilio');
const { generateReminder } = require('./ai-agent');

// Log reminder activity
async function logReminder(memberId, type, phone, message, status) {
  await supabase.from('reminders').insert({
    member_id: memberId,
    type,
    phone,
    message,
    status,
    sent_at: new Date().toISOString(),
  });
}

// ─── EXPIRY REMINDERS ─────────────────────────────────────────────────
async function sendExpiryReminders() {
  console.log('[Scheduler] Running expiry reminder check...');

  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);
  const in1Day = new Date(today);
  in1Day.setDate(today.getDate() + 1);

  const targets = [
    { date: in7Days, daysLeft: 7 },
    { date: in3Days, daysLeft: 3 },
    { date: in1Day, daysLeft: 1 },
  ];

  for (const target of targets) {
    const dateStr = target.date.toISOString().split('T')[0];

    const { data: members } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active')
      .like('expiry_date', `${dateStr}%`);

    if (!members || members.length === 0) continue;

    for (const member of members) {
      // Check if reminder already sent today
      const { data: existing } = await supabase
        .from('reminders')
        .select('id')
        .eq('member_id', member.id)
        .eq('type', `expiry_${target.daysLeft}d`)
        .gte('sent_at', today.toISOString().split('T')[0]);

      if (existing && existing.length > 0) continue;

      const message = await generateReminder('expiry', {
        name: member.name,
        daysLeft: target.daysLeft,
      });

      const finalMessage = message.replace('[RENEWAL_LINK]', 'https://wa.me/YOUR_NUMBER?text=Renew');
      const result = await sendMessage(member.phone, finalMessage);

      await logReminder(
        member.id,
        `expiry_${target.daysLeft}d`,
        member.phone,
        finalMessage,
        result.success ? 'sent' : 'failed'
      );

      console.log(`[Scheduler] Expiry reminder (${target.daysLeft}d) sent to ${member.name}`);
    }
  }
}

// ─── CLASS REMINDERS ──────────────────────────────────────────────────
async function sendClassReminders() {
  console.log('[Scheduler] Running class reminder check...');

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const windowStart = new Date(in24h.getTime() - 30 * 60 * 1000); // ±30 min window
  const windowEnd = new Date(in24h.getTime() + 30 * 60 * 1000);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, members(*)')
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .gte('class_datetime', windowStart.toISOString())
    .lte('class_datetime', windowEnd.toISOString());

  if (!bookings || bookings.length === 0) return;

  for (const booking of bookings) {
    const member = booking.members;
    if (!member) continue;

    const classTime = new Date(booking.class_datetime).toLocaleString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const message = await generateReminder('class_reminder', {
      name: member.name,
      className: booking.class_type || 'your class',
      time: classTime,
    });

    const result = await sendMessage(member.phone, message);

    // Mark reminder as sent
    await supabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id);

    await logReminder(member.id, 'class_24h', member.phone, message, result.success ? 'sent' : 'failed');
    console.log(`[Scheduler] Class reminder sent to ${member.name}`);
  }
}

// ─── INACTIVE MEMBER RE-ENGAGEMENT ───────────────────────────────────
async function reengageInactiveMembers() {
  console.log('[Scheduler] Checking inactive members...');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'active')
    .lt('last_visit', cutoff.toISOString());

  if (!members || members.length === 0) return;

  for (const member of members) {
    const daysInactive = Math.floor(
      (Date.now() - new Date(member.last_visit).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only send once per week
    const { data: recent } = await supabase
      .from('reminders')
      .select('id')
      .eq('member_id', member.id)
      .eq('type', 'inactive')
      .gte('sent_at', cutoff.toISOString());

    if (recent && recent.length > 0) continue;

    const message = await generateReminder('inactive', {
      name: member.name,
      daysInactive,
    });

    const result = await sendMessage(member.phone, message);
    await logReminder(member.id, 'inactive', member.phone, message, result.success ? 'sent' : 'failed');
    console.log(`[Scheduler] Re-engagement sent to ${member.name} (${daysInactive} days inactive)`);
  }
}

// ─── CRON SCHEDULE ───────────────────────────────────────────────────
function startScheduler() {
  console.log('[Scheduler] Starting cron jobs...');

  // Expiry reminders — every morning at 9 AM
  cron.schedule('0 9 * * *', sendExpiryReminders);

  // Class reminders — every hour
  cron.schedule('0 * * * *', sendClassReminders);

  // Inactive re-engagement — every Monday at 10 AM
  cron.schedule('0 10 * * 1', reengageInactiveMembers);

  console.log('[Scheduler] Jobs scheduled: expiry (daily 9AM), class (hourly), inactive (Mon 10AM)');
}

module.exports = { startScheduler, sendExpiryReminders, sendClassReminders, reengageInactiveMembers };
