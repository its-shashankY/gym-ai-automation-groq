const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { sendMessage } = require('../services/twilio');

// GET all members with filters
router.get('/', async (req, res) => {
  const { status, plan, search } = req.query;

  let query = supabase.from('members').select('*').order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (plan) query = query.eq('plan', plan);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET single member
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('*, bookings(*), reminders(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Member not found' });
  res.json(data);
});

// POST create member
router.post('/', async (req, res) => {
  const { name, phone, email, plan, expiry_date } = req.body;

  const { data, error } = await supabase.from('members').insert({
    name,
    phone,
    email,
    plan: plan || 'basic',
    status: 'active',
    expiry_date: expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    join_date: new Date().toISOString(),
    last_visit: new Date().toISOString(),
    visit_count: 0,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Send welcome message
  if (phone) {
    await sendMessage(phone,
      `🎉 Welcome to ${process.env.GYM_NAME}, ${name}! Your ${plan} membership is now active. We're excited to be part of your fitness journey! 💪 Reply anytime with questions.`
    );
  }

  res.json(data);
});

// PATCH update member
router.patch('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST send manual message to member
router.post('/:id/message', async (req, res) => {
  const { message } = req.body;

  const { data: member } = await supabase
    .from('members')
    .select('name, phone')
    .eq('id', req.params.id)
    .single();

  if (!member) return res.status(404).json({ error: 'Member not found' });

  const result = await sendMessage(member.phone, message);
  res.json(result);
});

// GET member stats summary
router.get('/stats/summary', async (req, res) => {
  const [
    { count: total },
    { count: active },
    { count: expiringSoon },
    { count: inactive },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('expiry_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('members').select('*', { count: 'exact', head: true })
      .lt('last_visit', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  res.json({ total, active, expiringSoon, inactive });
});

module.exports = router;
