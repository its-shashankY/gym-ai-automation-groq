import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Overview from './pages/Overview';
import Members from './pages/Members';
import Leads from './pages/Leads';
import Bookings from './pages/Bookings';
import Conversations from './pages/Conversations';
import Monitoring from './pages/Monitoring';
import './styles.css';

const NAV = [
  { to: '/', label: 'Overview', icon: '▦' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/leads', label: 'Leads', icon: '🎯' },
  { to: '/bookings', label: 'Bookings', icon: '📅' },
  { to: '/conversations', label: 'AI Chats', icon: '💬' },
  { to: '/monitoring', label: 'Monitoring', icon: '🔍' },
];

function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🏋️</span>
        <div>
          <div className="brand-name">GymAI</div>
          <div className="brand-sub">Automation Hub</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="status-dot green" />
        <span>All systems running</span>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/members" element={<Members />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
