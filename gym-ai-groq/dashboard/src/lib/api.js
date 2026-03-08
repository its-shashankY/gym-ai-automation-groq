const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getStats: () => req('/api/dashboard/stats'),
  getHealth: () => req('/health'),

  getMembers: (params = {}) => req(`/api/members?${new URLSearchParams(params)}`),
  getMember: (id) => req(`/api/members/${id}`),
  createMember: (data) => req('/api/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => req(`/api/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  messageMember: (id, message) => req(`/api/members/${id}/message`, { method: 'POST', body: JSON.stringify({ message }) }),

  getLeads: (params = {}) => req(`/api/leads?${new URLSearchParams(params)}`),
  updateLead: (id, data) => req(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getBookings: (params = {}) => req(`/api/bookings?${new URLSearchParams(params)}`),
  createBooking: (data) => req('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id, data) => req(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getConversationThreads: () => req('/api/conversations/threads'),
  getConversation: (phone) => req(`/api/conversations?phone=${encodeURIComponent(phone)}`),

  getReminders: () => req('/api/reminders'),

  testMessage: (phone, message) => req('/webhook/test', {
    method: 'POST', body: JSON.stringify({ phone, message })
  }),
};
