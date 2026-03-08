import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const DEMO = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', plan: 'premium', status: 'active', expiry_date: '2025-08-01', visit_count: 42, join_date: '2025-01-15' },
  { id: 2, name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', plan: 'standard', status: 'active', expiry_date: '2025-07-10', visit_count: 18, join_date: '2025-02-10' },
  { id: 3, name: 'Amit Kumar', phone: '+91 76543 21098', email: 'amit@email.com', plan: 'basic', status: 'active', expiry_date: '2025-07-05', visit_count: 8, join_date: '2025-06-05' },
  { id: 4, name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', plan: 'premium', status: 'inactive', expiry_date: '2025-06-20', visit_count: 31, join_date: '2024-12-01' },
  { id: 5, name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', plan: 'standard', status: 'active', expiry_date: '2025-08-15', visit_count: 55, join_date: '2024-10-01' },
];

function planBadge(plan) {
  const map = { premium: 'badge-accent', standard: 'badge-blue', basic: 'badge-gray' };
  return <span className={`badge ${map[plan] || 'badge-gray'}`}>{plan}</span>;
}
function statusBadge(status) {
  return <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-red'}`}>{status}</span>;
}

function daysUntilExpiry(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function AddMemberModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', plan: 'basic', expiry_date: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    try {
      await api.createMember(form);
      onAdd();
      onClose();
    } catch {
      // Demo mode — just close
      onAdd();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">➕ Add New Member</div>
        {[
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Sharma' },
          { label: 'Phone', key: 'phone', type: 'text', placeholder: '+91 98765 43210' },
          { label: 'Email', key: 'email', type: 'email', placeholder: 'rahul@email.com' },
          { label: 'Expiry Date', key: 'expiry_date', type: 'date' },
        ].map(f => (
          <div key={f.key} className="form-row">
            <label>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}
        <div className="form-row">
          <label>Plan</label>
          <select value={form.plan} onChange={e => set('plan', e.target.value)}>
            <option value="basic">Basic — ₹999/month</option>
            <option value="standard">Standard — ₹1499/month</option>
            <option value="premium">Premium — ₹2499/month</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Member + Send Welcome</button>
        </div>
      </div>
    </div>
  );
}

function MessageModal({ member, onClose }) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try { await api.messageMember(member.id, msg); } catch {}
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">💬 Message {member.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{member.phone}</div>
        <div className="form-row">
          <label>WhatsApp Message</label>
          <textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Hey Rahul! Your membership expires in 3 days..." />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          {sent
            ? <span style={{ color: 'var(--green)', fontSize: 13 }}>✅ Sent!</span>
            : <button className="btn btn-primary btn-sm" onClick={handleSend}>Send Message</button>
          }
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState(DEMO);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchFilter = filter === 'all' || m.status === filter ||
      (filter === 'expiring' && daysUntilExpiry(m.expiry_date) <= 7);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <div className="page-title">👥 Members</div>
          <div className="page-sub">Manage all gym members</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Member</button>
      </div>

      {/* Filters */}
      <div className="flex-center gap-12 mb-16">
        <input style={{ maxWidth: 220 }} placeholder="🔍 Search name / phone..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'inactive', 'expiring'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th><th>Phone</th><th>Plan</th><th>Status</th>
              <th>Expiry</th><th>Visits</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const days = daysUntilExpiry(m.expiry_date);
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.email}</div>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{m.phone}</td>
                  <td>{planBadge(m.plan)}</td>
                  <td>{statusBadge(m.status)}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{m.expiry_date?.split('T')[0]}</div>
                    <div style={{ fontSize: 11, color: days <= 3 ? 'var(--accent2)' : days <= 7 ? 'var(--orange)' : 'var(--text3)' }}>
                      {days <= 0 ? 'Expired' : `${days}d left`}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{m.visit_count}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setMsgTarget(m)}>💬</button>
                      <button className="btn btn-ghost btn-sm">✏️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty"><div className="empty-icon">👥</div>No members found</div>}
      </div>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={() => {}} />}
      {msgTarget && <MessageModal member={msgTarget} onClose={() => setMsgTarget(null)} />}
    </div>
  );
}
