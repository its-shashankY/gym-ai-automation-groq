import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

const DEMO_THREADS = [
  { phone: '+91 91234 56789', lastMessage: 'Thanks! I'll come for the trial on Wednesday 💪', lastTime: '2025-07-01T16:30:00Z', count: 8 },
  { phone: '+91 80123 45678', lastMessage: 'What is the difference between standard and premium?', lastTime: '2025-07-01T15:00:00Z', count: 5 },
  { phone: '+91 79012 34567', lastMessage: 'Can I reschedule my PT session to 7PM?', lastTime: '2025-07-01T13:45:00Z', count: 12 },
  { phone: '+91 68901 23456', lastMessage: 'My membership expires soon, how do I renew?', lastTime: '2025-07-01T11:00:00Z', count: 6 },
];

const DEMO_CONV = {
  '+91 91234 56789': [
    { role: 'user', message: 'Hi, I want to join the gym', created_at: '2025-07-01T16:00:00Z' },
    { role: 'assistant', message: "Hey! 👋 Welcome to FitZone Gym! I'm your AI assistant. Quick question — what's your main fitness goal?\n1️⃣ Weight Loss\n2️⃣ Muscle Building\n3️⃣ General Fitness\n4️⃣ Sports Training", created_at: '2025-07-01T16:00:10Z' },
    { role: 'user', message: 'Weight loss', created_at: '2025-07-01T16:01:00Z' },
    { role: 'assistant', message: "Perfect choice! We have amazing results for weight loss 💪 Our plans start at ₹999/month. May I know your name so I can help you better?", created_at: '2025-07-01T16:01:10Z' },
    { role: 'user', message: 'Arjun', created_at: '2025-07-01T16:02:00Z' },
    { role: 'assistant', message: "Great to meet you Arjun! 🔥 We'd love to offer you a FREE trial session this week. Are you available Wednesday or Thursday?", created_at: '2025-07-01T16:02:10Z' },
    { role: 'user', message: 'Wednesday works', created_at: '2025-07-01T16:28:00Z' },
    { role: 'assistant', message: "Booked! ✅ Free trial on Wednesday at FitZone Gym. Our trainer will be ready for you. Address: 123 Main Street. See you there Arjun! 💪", created_at: '2025-07-01T16:28:15Z' },
  ],
};

function timeStr(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Conversations() {
  const [threads] = useState(DEMO_THREADS);
  const [active, setActive] = useState(DEMO_THREADS[0]?.phone);
  const [conv, setConv] = useState(DEMO_CONV[DEMO_THREADS[0]?.phone] || []);
  const [testPhone, setTestPhone] = useState('demo_visitor');
  const [testInput, setTestInput] = useState('');
  const [testConv, setTestConv] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    setConv(DEMO_CONV[active] || []);
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testConv]);

  const sendTest = async () => {
    if (!testInput.trim()) return;
    const userMsg = testInput.trim();
    setTestInput('');
    setTestConv(c => [...c, { role: 'user', message: userMsg, created_at: new Date().toISOString() }]);
    setSending(true);

    try {
      const result = await api.testMessage(testPhone, userMsg);
      setTestConv(c => [...c, { role: 'assistant', message: result.reply, created_at: new Date().toISOString() }]);
    } catch {
      // Demo fallback responses
      const demos = [
        "Hey! 👋 Welcome to FitZone Gym! I'm your AI assistant. What's your main fitness goal?\n1️⃣ Weight Loss  2️⃣ Muscle Building  3️⃣ General Fitness",
        "Great choice! Our plans start at ₹999/month for Basic, ₹1499 for Standard, ₹2499 for Premium. Which fits your budget? 💪",
        "Perfect! I can book you a FREE trial session. Are you available this week? 🔥",
        "Booked! ✅ Your free trial is confirmed. See you at FitZone Gym! 123 Main Street. Any questions?",
      ];
      const reply = demos[testConv.length % demos.length];
      setTestConv(c => [...c, { role: 'assistant', message: reply, created_at: new Date().toISOString() }]);
    }
    setSending(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💬 AI Conversations</div>
        <div className="page-sub">Live chat logs and AI test console</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Chat History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>CONVERSATION HISTORY</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', height: 480 }}>
            {/* Thread list */}
            <div style={{ borderRight: '1px solid var(--border)', overflow: 'y-auto' }}>
              {threads.map(t => (
                <div key={t.phone}
                  onClick={() => setActive(t.phone)}
                  style={{
                    padding: '10px 12px', cursor: 'pointer',
                    background: active === t.phone ? 'rgba(232,255,71,0.05)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: active === t.phone ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--text)', marginBottom: 2 }}>
                    {t.phone.slice(-10)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.lastMessage}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{t.count} msgs</div>
                </div>
              ))}
            </div>

            {/* Messages */}
            <div className="chat-wrap" style={{ borderRadius: 0 }}>
              {conv.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  <div className="bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                  <div className="chat-time">{timeStr(m.created_at)}</div>
                </div>
              ))}
              {conv.length === 0 && (
                <div className="empty"><div className="empty-icon">💬</div>No messages yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Test AI Console */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>🧪 TEST AI AGENT LIVE</div>
            <span style={{ fontSize: 11, color: 'var(--green)' }}>● Online</span>
          </div>

          <div className="chat-wrap" style={{ height: 380, borderRadius: 0 }}>
            {testConv.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                Send a message to test the AI agent.<br />
                <span style={{ fontSize: 11 }}>Try: "Hi, I want to join the gym"</span>
              </div>
            )}
            {testConv.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                <div className="chat-time">{timeStr(m.created_at)}</div>
              </div>
            ))}
            {sending && (
              <div className="chat-msg assistant">
                <div className="bubble" style={{ color: 'var(--text3)' }}>AI is typing...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              placeholder="Type a test message..."
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendTest()}
              disabled={sending}
            />
            <button className="btn btn-primary btn-sm" onClick={sendTest} disabled={sending}>
              {sending ? '...' : 'Send'}
            </button>
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Quick test prompts:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Hi, I want to join', 'What are your plans?', 'Book a trial session', 'Gym timings?', 'Renew membership'].map(p => (
                <button key={p} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                  onClick={() => { setTestInput(p); }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
