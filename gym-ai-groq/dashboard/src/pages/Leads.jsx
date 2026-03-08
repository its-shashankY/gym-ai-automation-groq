import { useState } from 'react';

const DEMO_LEADS = [
  { id: 1, name: 'Arjun Mehta', phone: '+91 91234 56789', goal: 'Weight Loss', status: 'new', created_at: '2025-07-01T09:00:00Z' },
  { id: 2, name: 'Kavya Nair', phone: '+91 80123 45678', goal: 'Muscle Building', status: 'qualified', created_at: '2025-07-01T10:30:00Z' },
  { id: 3, name: 'Ravi Teja', phone: '+91 79012 34567', goal: 'General Fitness', status: 'trial_booked', created_at: '2025-06-30T14:00:00Z' },
  { id: 4, name: 'Meena Pillai', phone: '+91 68901 23456', goal: 'Weight Loss', status: 'converted', created_at: '2025-06-28T11:00:00Z' },
  { id: 5, name: 'Suresh Babu', phone: '+91 57890 12345', goal: 'Sports Training', status: 'new', created_at: '2025-07-01T16:00:00Z' },
  { id: 6, name: 'Deepa Krishnan', phone: '+91 46789 01234', goal: 'Weight Loss', status: 'qualified', created_at: '2025-06-29T09:30:00Z' },
  { id: 7, name: 'Prakash Rao', phone: '+91 35678 90123', goal: 'Muscle Building', status: 'trial_booked', created_at: '2025-06-30T16:00:00Z' },
  { id: 8, name: 'Anitha Devi', phone: '+91 24567 89012', goal: 'General Fitness', status: 'converted', created_at: '2025-06-25T10:00:00Z' },
];

const STAGES = [
  { key: 'new', label: '🆕 New Lead', color: '#06b6d4' },
  { key: 'qualified', label: '✅ Qualified', color: '#3b82f6' },
  { key: 'trial_booked', label: '📅 Trial Booked', color: '#f97316' },
  { key: 'converted', label: '💰 Converted', color: '#22c55e' },
];

function goalBadge(goal) {
  const map = {
    'Weight Loss': 'badge-orange',
    'Muscle Building': 'badge-red',
    'General Fitness': 'badge-blue',
    'Sports Training': 'badge-teal',
  };
  return <span className={`badge ${map[goal] || 'badge-gray'}`}>{goal}</span>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  return d > 0 ? `${d}d ago` : `${h}h ago`;
}

export default function Leads() {
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [selected, setSelected] = useState(null);

  const move = (id, newStatus) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setSelected(null);
  };

  const total = leads.length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const rate = Math.round((converted / total) * 100);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎯 Lead Pipeline</div>
        <div className="page-sub">AI-captured leads from WhatsApp and web</div>
      </div>

      {/* Summary */}
      <div className="stats-grid mb-24" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {STAGES.map(s => {
          const count = leads.filter(l => l.status === s.key).length;
          return (
            <div key={s.key} className="stat-card" style={{ '--accent-color': s.color }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: s.color }} />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{count}</div>
              <div className="stat-sub">{Math.round((count / total) * 100)}% of total</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {STAGES.map(stage => (
          <div key={stage.key} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            {/* Column header */}
            <div style={{
              padding: '12px 14px',
              background: 'var(--surface2)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: stage.color }}>{stage.label}</span>
              <span style={{
                background: 'rgba(255,255,255,0.08)', padding: '2px 7px',
                borderRadius: 99, fontSize: 11, color: 'var(--text2)',
              }}>
                {leads.filter(l => l.status === stage.key).length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
              {leads.filter(l => l.status === stage.key).map(lead => (
                <div key={lead.id}
                  onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                  style={{
                    background: selected?.id === lead.id ? 'rgba(232,255,71,0.06)' : 'var(--bg)',
                    border: `1px solid ${selected?.id === lead.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{lead.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {goalBadge(lead.goal)}
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{timeAgo(lead.created_at)}</span>
                  </div>

                  {/* Actions when selected */}
                  {selected?.id === lead.id && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {STAGES.filter(s => s.key !== stage.key).map(s => (
                        <button key={s.key} className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, justifyContent: 'flex-start' }}
                          onClick={e => { e.stopPropagation(); move(lead.id, s.key); }}>
                          → Move to {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {leads.filter(l => l.status === stage.key).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
                  No leads here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion rate bar */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="flex-between mb-16">
          <div className="card-title">Conversion Funnel</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{rate}% conversion rate</span>
        </div>
        <div style={{ position: 'relative', height: 12, background: 'var(--surface2)', borderRadius: 99 }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${rate}%`,
            background: 'linear-gradient(90deg, var(--teal), var(--green))',
            borderRadius: 99, transition: 'width 0.5s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
          <span>{total} total leads</span>
          <span>{converted} converted</span>
        </div>
      </div>
    </div>
  );
}
