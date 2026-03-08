# 🏋️ GYM AI Automation — Groq Edition

AI-powered gym automation using **Groq** (free, ultra-fast LLM API) + Supabase + Twilio.

---

## ⚡ What's Inside

| Layer | Tool | Cost |
|-------|------|------|
| AI Brain | **Groq** (LLaMA 3.3 70B) | **100% FREE** |
| Database | Supabase | Free tier |
| WhatsApp/SMS | Twilio | $15 free credit |
| Backend | Node.js + Express | Free |
| Dashboard | React + Vite | Free |

> Groq gives you **~14,400 requests/day free** with LLaMA 3.3 70B — more than enough for any gym demo.

---

## 🚀 30-Minute Setup

### STEP 1 — Get Groq API Key (2 min) ← START HERE

1. Go to **https://console.groq.com**
2. Sign up (free, no credit card needed)
3. Click **"API Keys"** → **"Create API Key"**
4. Copy it → paste as `GROQ_API_KEY` in your `.env`

Available free models (set via `GROQ_MODEL`):
- `llama-3.3-70b-versatile` — best quality ✅ (default)
- `llama-3.1-8b-instant` — fastest response
- `mixtral-8x7b-32768` — best for long conversations

---

### STEP 2 — Supabase Database (5 min)

1. Go to **https://supabase.com** → Create free project
2. **SQL Editor → New Query** → paste `backend/supabase-schema.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public` key → `SUPABASE_ANON_KEY`

---

### STEP 3 — Twilio WhatsApp (5 min)

1. Go to **https://twilio.com** → Sign up (free $15 credit)
2. Copy **Account SID** and **Auth Token**
3. **Messaging → Try WhatsApp → Sandbox Settings**
4. Join sandbox: send the join code to the Twilio WhatsApp number
5. Set webhook: `https://YOUR-BACKEND-URL/webhook/twilio`

---

### STEP 4 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys (GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, TWILIO_*)
npm run dev
```

Output:
```
🏋️  GYM AI Automation Backend (Groq) running on port 3001
📡 Webhook: http://localhost:3001/webhook/twilio
```

Test the AI instantly (no Twilio needed):
```bash
curl -X POST http://localhost:3001/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919999999999", "message": "Hi I want to join the gym"}'
```

---

### STEP 5 — Dashboard

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5173
```

---

### STEP 6 — Expose for Twilio (local testing)

```bash
npm install -g ngrok
ngrok http 3001
# Copy the https URL → paste in Twilio webhook settings
```

---

## 📁 Project Structure

```
gym-ai-automation/
├── README.md
├── backend/
│   ├── index.js                    ← Express server
│   ├── package.json                ← groq-sdk dependency
│   ├── .env.example                ← Copy to .env
│   ├── supabase-schema.sql         ← Run in Supabase SQL editor
│   ├── routes/
│   │   ├── webhook.js              ← Twilio inbound handler
│   │   ├── members.js              ← Members CRUD API
│   │   └── data.js                 ← Stats, leads, bookings, conversations
│   └── services/
│       ├── ai-agent.js             ← Groq LLaMA AI brain ⭐
│       ├── scheduler.js            ← Cron: expiry, class, inactive reminders
│       ├── twilio.js               ← WhatsApp/SMS sender
│       └── supabase.js             ← DB client
└── dashboard/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                 ← Layout + routing
        ├── styles.css              ← Dark theme
        ├── main.jsx
        ├── lib/api.js              ← API client
        └── pages/
            ├── Overview.jsx        ← KPI stats + charts
            ├── Members.jsx         ← Member management
            ├── Leads.jsx           ← Kanban pipeline
            ├── Bookings.jsx        ← Class bookings
            ├── Conversations.jsx   ← Chat logs + live AI test console
            └── Monitoring.jsx      ← System health + cron status
```

---

## 💬 How the AI Agent Works (Groq)

```
Customer WhatsApp → Twilio webhook → backend/routes/webhook.js
  → services/ai-agent.js
      → loads conversation history from Supabase
      → sends to Groq API (LLaMA 3.3 70B)
      → parses LEAD_CAPTURED / BOOKING_COMPLETE commands
      → saves reply to Supabase
  → services/twilio.js → sends reply to customer
```

---

## 🤖 Groq vs Other APIs

| Feature | Groq (Free) | OpenAI | Anthropic |
|---------|-------------|--------|-----------|
| Cost | FREE | Pay per token | Pay per token |
| Speed | ~500 tokens/sec | ~80 t/s | ~100 t/s |
| Model | LLaMA 3.3 70B | GPT-4o | Claude 3.5 |
| Daily limit | ~14,400 req/day | None (paid) | None (paid) |
| Setup | API key only | API key only | API key only |

---

## 💰 Total Cost for Demo

Everything runs **free** for a demo:
- Groq: 100% free (14,400 req/day)
- Supabase: free tier (500MB)
- Twilio: $15 free credit (~500 WhatsApp messages)
- Hosting locally: free

For a real gym (200 members): ~₹800-1200/month (mostly Twilio SMS costs).

---

## 🔧 Common Issues

**"invalid_api_key" from Groq**
→ Double-check GROQ_API_KEY in .env starts with `gsk_`

**"model not found"**
→ Check GROQ_MODEL is one of: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`

**Twilio not delivering WhatsApp**
→ Make sure you sent the join code to the sandbox number first

**Supabase connection error**
→ Verify SUPABASE_URL format: `https://xxxxx.supabase.co` (no trailing slash)
