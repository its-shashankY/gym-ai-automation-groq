import { useState } from 'react';

const DEMO = [
  { id:1, name:'Rahul Sharma', class_type:'Zumba', class_datetime:'2025-07-02T18:00:00Z', status:'confirmed', reminder_sent:true },
  { id:2, name:'Priya Patel', class_type:'Personal Training', class_datetime:'2025-07-02T19:00:00Z', status:'confirmed', reminder_sent:false },
  { id:3, name:'Amit Kumar', class_type:'Yoga', class_datetime:'2025-07-03T07:00:00Z', status:'confirmed', reminder_sent:false },
  { id:4, name:'Sneha Reddy', class_type:'Cardio', class_datetime:'2025-07-03T06:00:00Z', status:'cancelled', reminder_sent:false },
  { id:5, name:'Vikram Singh', class_type:'Personal Training', class_datetime:'2025-07-04T19:00:00Z', status:'confirmed', reminder_sent:false },
  { id:6, name:'Arjun Mehta', class_type:'Zumba', class_datetime:'2025-07-04T18:00:00Z', status:'pending', reminder_sent:false },
];

const CLASS_COLORS = {
  'Zumba': '#e8ff47',
  'Personal Training': '#06b6d4',
  'Yoga': '#a855f7',
  'Cardio': '#ff4757',
  'CrossFit': '#f97316',
};

function dt(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
  };
}

export default function Bookings() {
  const [bookings, setBookings] = useState(DEMO);
  const [filter, setFilter] = useState('all');

  const cancel = (id) => {
    setBookings(b => b.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📅 Bookings</div>
        <div className="page-sub">Class and PT session bookings managed by AI</div>
      </div>

      {/* Summary */}
      <div className="stats-grid mb-24" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card green"><div className="stat-label">Confirmed</div><div className="stat-value">{counts.confirmed}</div></div>
        <div className="stat-card orange"><div className="stat-label">Pending</div><div className="stat-value">{counts.pending}</div></div>
        <div className="stat-card red"><div className="stat-label">Cancelled</div><div className="stat-value">{counts.cancelled}</div></div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Member</th><th>Class</th><th>Date</th><th>Time</th><th>Status</th><th>Reminder</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const { date, time } = dt(b.class_datetime);
              const color = CLASS_COLORS[b.class_type] || '#8891a8';
              return (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      {b.class_type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{date}</td>
                  <td style={{ fontWeight: 600 }}>{time}</td>
                  <td>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : b.status === 'pending' ? 'badge-orange' : 'badge-red'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.reminder_sent
                      ? <span className="badge badge-teal">✅ Sent</span>
                      : <span className="badge badge-gray">Pending</span>
                    }
                  </td>
                  <td>
                    {b.status !== 'cancelled' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty"><div className="empty-icon">📅</div>No bookings found</div>}
      </div>

      {/* Upcoming classes visual */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Upcoming Classes This Week</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(CLASS_COLORS).map(([cls, color]) => {
            const count = bookings.filter(b => b.class_type === cls && b.status === 'confirmed').length;
            if (!count) return null;
            return (
              <div key={cls} style={{
                background: 'var(--surface2)', border: `1px solid ${color}30`,
                borderRadius: 8, padding: '10px 14px', minWidth: 120,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginBottom: 6 }} />
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{cls}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>bookings</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
