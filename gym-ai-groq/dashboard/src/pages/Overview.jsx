import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';

// Demo chart data (replace with real data from API)
const weeklyData = [
  { day: 'Mon', leads: 3, bookings: 5, messages: 18 },
  { day: 'Tue', leads: 5, bookings: 8, messages: 24 },
  { day: 'Wed', leads: 2, bookings: 6, messages: 15 },
  { day: 'Thu', leads: 7, bookings: 10, messages: 32 },
  { day: 'Fri', leads: 4, bookings: 7, messages: 28 },
  { day: 'Sat', leads: 9, bookings: 14, messages: 41 },
  { day: 'Sun', leads: 6, bookings: 9, messages: 22 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#181b22', border: '1px solid #2a2f3d', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: '#8891a8', fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// Live activity feed
const MOCK_ACTIVITY = [
  { time: '2 min ago', icon: '💬', text: 'New lead from WhatsApp — Rahul Sharma', type: 'lead' },
  { time: '8 min ago', icon: '📅', text: 'Booking confirmed — Priya Patel (Zumba, 6PM)', type: 'booking' },
  { time: '15 min ago', icon: '🔔', text: 'Renewal reminder sent — Amit Kumar (expires in 3 days)', type: 'reminder' },
  { time: '22 min ago', icon: '⭐', text: 'Review request sent — Sneha Reddy', type: 'review' },
  { time: '35 min ago', icon: '💪', text: 'New member added — Vikram Singh (Premium plan)', type: 'member' },
  { time: '1 hr ago', icon: '💬', text: 'AI resolved enquiry — gym timings + pricing', type: 'chat' },
  { time: '1.5 hr ago', icon: '🎯', text: 'Lead qualified — Neha Joshi (Weight Loss)', type: 'lead' },
];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => {
        // Show demo data if backend not connected
        setStats({
          totalMembers: 147, activeMembers: 132,
          totalLeads: 38, newLeadsToday: 4,
          bookingsToday: 12, messagesTotal: 842,
          messagesToday: 24, remindersSent: 18,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const s = stats || {};

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <div className="page-title">🏋️ GymAI Dashboard</div>
          <div className="page-sub">Real-time overview of your AI automation system</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--green)' }}>
          <div className="status-dot green" />
          AI Agent Online
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Members', value: s.totalMembers ?? '—', sub: `${s.activeMembers ?? '—'} active`, color: 'accent' },
          { label: 'Total Leads', value: s.totalLeads ?? '—', sub: `+${s.newLeadsToday ?? 0} today`, color: 'teal' },
          { label: 'Bookings Today', value: s.bookingsToday ?? '—', sub: 'Confirmed', color: 'blue' },
          { label: 'AI Messages', value: s.messagesToday ?? '—', sub: `${s.messagesTotal ?? '—'} total`, color: 'green' },
          { label: 'Reminders Sent', value: s.remindersSent ?? '—', sub: 'This week', color: 'orange' },
          { label: 'Automation Rate', value: '94%', sub: 'Queries handled by AI', color: 'purple' },
        ].map(st => (
          <div key={st.label} className={`stat-card ${st.color}`}>
            <div className="stat-label">{st.label}</div>
            <div className="stat-value">{st.value}</div>
            <div className="stat-sub">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-title">Weekly Activity</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8ff47" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e8ff47" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8891a8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8891a8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="messages" stroke="#e8ff47" fill="url(#msgGrad)" strokeWidth={2} name="Messages" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Leads vs Bookings</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8891a8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8891a8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="#06b6d4" radius={[4,4,0,0]} name="Leads" />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Live Activity Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 0',
                borderBottom: i < MOCK_ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.text}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🧪', label: 'Test AI Chatbot', desc: 'Send a test message to the AI agent', color: '#e8ff47' },
              { icon: '📣', label: 'Broadcast Message', desc: 'Send WhatsApp to all active members', color: '#06b6d4' },
              { icon: '🔔', label: 'Run Reminders Now', desc: 'Trigger expiry reminder batch', color: '#f97316' },
              { icon: '➕', label: 'Add New Member', desc: 'Manually add a walk-in member', color: '#22c55e' },
            ].map((qa, i) => (
              <a key={i} href={i === 0 ? '/conversations' : '#'} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = qa.color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: 20 }}>{qa.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: qa.color }}>{qa.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{qa.desc}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
