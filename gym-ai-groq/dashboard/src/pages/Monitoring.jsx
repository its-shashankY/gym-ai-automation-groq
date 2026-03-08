import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const SERVICES = [
  { key: 'supabase',  name: 'Supabase Database', icon: '🗄', desc: 'Members, leads, bookings, conversations' },
  { key: 'twilio',    name: 'Twilio WhatsApp',   icon: '📱', desc: 'Inbound/outbound WhatsApp messages' },
  { key: 'groq', name: 'Groq AI Agent',   icon: '🤖', desc: 'AI brain for chat and reminder generation' },
];

const REMINDER_TYPES = [
  { type: 'expiry_7d',  label: '7-Day Expiry Reminder', schedule: 'Daily 9AM', color: 'badge-orange' },
  { type: 'expiry_3d',  label: '3-Day Expiry Reminder', schedule: 'Daily 9AM', color: 'badge-red' },
  { type: 'expiry_1d',  label: '1-Day Expiry Reminder', schedule: 'Daily 9AM', color: 'badge-red' },
  { type: 'class_24h',  label: 'Class Reminder (24hr)',  schedule: 'Hourly',    color: 'badge-blue' },
  { type: 'inactive',   label: 'Inactive Re-engagement', schedule: 'Monday 10AM', color: 'badge-teal' },
  { type: 'review',     label: 'Google Review Request',  schedule: 'After 5th visit', color: 'badge-accent' },
];

const MOCK_RECENT = [
  { type: 'expiry_3d', member: 'Amit Kumar', status: 'sent', time: '9:01 AM', msg: 'Hey Amit! Your membership expires in 3 days...' },
  { type: 'class_24h', member: 'Rahul Sharma', status: 'sent', time: '6:00 AM', msg: 'Reminder: Your Zumba class is tomorrow at 6PM!' },
  { type: 'inactive',  member: 'Deepa Krishnan', status: 'sent', time: 'Mon 10AM', msg: "Hey Deepa, we miss you at FitZone! It's been 9 days..." },
  { type: 'expiry_7d', member: 'Priya Patel', status: 'failed', time: '9:02 AM', msg: 'Could not deliver — invalid number' },
];

export default function Monitoring() {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth({ status: 'error', services: { supabase: false, twilio: false, groq: false } });
    }
    setChecking(false);
  };

  useEffect(() => { checkHealth(); }, []);

  const services = health?.services || {};

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <div className="page-title">🔍 System Monitoring</div>
          <div className="page-sub">Health checks, automation queue, and error logs</div>
        </div>
        <button className="btn btn-ghost" onClick={checkHealth} disabled={checking}>
          {checking ? 'Checking...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="grid-2 mb-24">
        {/* Service Health */}
        <div className="card">
          <div className="card-title">Service Health</div>
          {SERVICES.map(svc => {
            const isOk = health ? services[svc.key] : null;
            return (
              <div key={svc.key} className="health-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{svc.icon}</span>
                  <div>
                    <div className="health-name">{svc.name}</div>
                    <div className="health-sub">{svc.desc}</div>
                  </div>
                </div>
                <div>
                  {isOk === null
                    ? <span className="ping-check">Checking…</span>
                    : isOk
                      ? <span className="ping-ok">✅ Connected</span>
                      : <span className="ping-fail">❌ Not configured</span>
                  }
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, fontSize: 12, color: 'var(--text3)' }}>
            💡 If a service shows "Not configured", add the API key to your <code style={{ color: 'var(--accent)', fontSize: 11 }}>.env</code> file and restart the backend.
          </div>
        </div>

        {/* Automation Queue */}
        <div className="card">
          <div className="card-title">Cron Jobs Schedule</div>
          {[
            { icon: '⏰', label: 'Expiry Reminders', time: 'Daily 9:00 AM', status: 'active' },
            { icon: '📅', label: 'Class Reminders',  time: 'Every Hour',    status: 'active' },
            { icon: '💤', label: 'Inactive Members', time: 'Monday 10:00 AM', status: 'active' },
          ].map(job => (
            <div key={job.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{job.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{job.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{job.time}</div>
                </div>
              </div>
              <span className="badge badge-green">● Active</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Manual Triggers</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm">Run Expiry Check</button>
              <button className="btn btn-ghost btn-sm">Run Class Check</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Types */}
      <div className="card mb-24">
        <div className="card-title">Automated Reminder Types</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {REMINDER_TYPES.map(r => (
            <div key={r.type} style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.label}</span>
                <span className={`badge ${r.color}`}>On</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>🕐 {r.schedule}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reminder Log */}
      <div className="card">
        <div className="card-title">Recent Reminder Log</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr><th>Type</th><th>Member</th><th>Message Preview</th><th>Sent At</th><th>Status</th></tr>
            </thead>
            <tbody>
              {MOCK_RECENT.map((r, i) => (
                <tr key={i}>
                  <td><span className="badge badge-blue">{r.type}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.member}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)', fontSize: 12 }}>
                    {r.msg}
                  </td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{r.time}</td>
                  <td>
                    <span className={`badge ${r.status === 'sent' ? 'badge-green' : 'badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
