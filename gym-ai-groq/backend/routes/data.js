const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// ─── BOOKINGS ─────────────────────────────────────────────────────────

router.get('/bookings', async (req, res) => {
  const { date, status } = req.query;
  let query = supabase.from('bookings').select('*, members(name, phone)').order('class_datetime', { ascending: true });
  if (status) query = query.eq('status', status);
  if (date) {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    query = query.gte('class_datetime', start.toISOString()).lte('class_datetime', end.toISOString());
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/bookings', async (req, res) => {
  const { member_id, class_type, class_datetime, phone } = req.body;
  const { data, error } = await supabase.from('bookings').insert({
    member_id, class_type, class_datetime, phone,
    status: 'confirmed',
    reminder_sent: false,
    created_at: new Date().toISOString(),
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/bookings/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── LEADS ───────────────────────────────────────────────────────────

router.get('/leads', async (req, res) => {
  const { status } = req.query;
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/leads/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('leads').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── CONVERSATIONS ────────────────────────────────────────────────────

router.get('/conversations', async (req, res) => {
  const { phone } = req.query;
  let query = supabase.from('conversations').select('*').order('created_at', { ascending: true });
  if (phone) query = query.eq('phone', phone);
  const { data, error } = await query.limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get all unique conversations (grouped by phone)
router.get('/conversations/threads', async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('phone, message, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Group by phone, get last message
  const threads = {};
  for (const row of (data || [])) {
    if (!threads[row.phone]) {
      threads[row.phone] = { phone: row.phone, lastMessage: row.message, lastTime: row.created_at, count: 0 };
    }
    threads[row.phone].count++;
  }

  res.json(Object.values(threads));
});

// ─── REMINDERS ────────────────────────────────────────────────────────

router.get('/reminders', async (req, res) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*, members(name)')
    .order('sent_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────

router.get('/dashboard/stats', async (req, res) => {
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalLeads },
    { count: newLeadsToday },
    { count: bookingsToday },
    { count: messagesTotal },
    { count: messagesToday },
    { count: remindersSent },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', weekStart.toISOString()),
  ]);

  res.json({
    totalMembers, activeMembers, totalLeads,
    newLeadsToday, bookingsToday,
    messagesTotal, messagesToday, remindersSent,
  });
});

module.exports = router;
