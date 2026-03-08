require('dotenv').config();
const express = require('express');
const cors = require('cors');

const webhookRoutes = require('./routes/webhook');
const memberRoutes = require('./routes/members');
const dataRoutes = require('./routes/data');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for Twilio webhooks

// ─── Routes ───────────────────────────────────────────────────────────
app.use('/webhook', webhookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api', dataRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gym: process.env.GYM_NAME,
    timestamp: new Date().toISOString(),
    services: {
      supabase: !!process.env.SUPABASE_URL,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      groq: !!process.env.GROQ_API_KEY,
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏋️  ${process.env.GYM_NAME || 'Gym AI'} Backend running on port ${PORT}`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook/twilio`);
  console.log(`🧪 Test: POST http://localhost:${PORT}/webhook/test`);
  console.log(`📊 API: http://localhost:${PORT}/api/dashboard/stats`);

  // Start cron scheduler
  startScheduler();
});

module.exports = app;
