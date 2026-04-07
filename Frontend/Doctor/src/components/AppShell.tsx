import { Bell, ClipboardPlus, FileText, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, TimerReset, UserRound } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../data/mockData';
import { useState } from 'react';
import Logo from './Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/access', label: 'Access Patient', icon: ClipboardPlus },
  { to: '/overview', label: 'Patient Overview', icon: UserRound },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/sessions', label: 'Sessions', icon: TimerReset },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleTheme } = useTheme();
  const { doctorName, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-bg mobile-bottom-space">
      <div className="container" style={{ padding: '22px 0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 22 }} className="shell-grid">
          <aside className="card sidebar" style={{ padding: 20, position: 'sticky', top: 18, alignSelf: 'start', height: 'calc(100vh - 36px)', transform: open ? 'translateX(0)' : undefined, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Logo compact />
              <button className="btn btn-secondary mobile-only" onClick={() => setOpen(false)} style={{ display: 'none', width: 40, height: 40, borderRadius: 14, padding: 0 }}>×</button>
            </div>
            <div className="panel" style={{ padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 6 }}>Signed in as</div>
              <div style={{ fontWeight: 700 }}>{doctorName}</div>
              <div className="muted" style={{ fontSize: 14 }}>Cardiology · SehatScan partner clinic</div>
            </div>
            <nav style={{ display: 'grid', gap: 10 }}>
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16,
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text)',
                    fontWeight: 700,
                  })}
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }} onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </aside>

          <div style={{ minWidth: 0 }}>
            <header className="card" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-secondary mobile-toggle" onClick={() => setOpen((v) => !v)} style={{ display: 'none', width: 46, height: 46, padding: 0, borderRadius: 16 }}><Menu size={18} /></button>
                <div>
                  <div className="muted" style={{ fontSize: 13 }}>Welcome back</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>Hello, {doctorName.split(' ')[1] || 'Doctor'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Link to="/access" className="btn btn-primary"><ClipboardPlus size={18} /> Enter Patient OTP</Link>
                <button className="btn btn-secondary" onClick={toggleTheme}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                <button className="btn btn-secondary" title={notifications[0]}><Bell size={18} /></button>
              </div>
            </header>
            {children}
          </div>
        </div>
      </div>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)', zIndex: 19 }} />}
      <style>{`
        @media (max-width: 980px) {
          .shell-grid { grid-template-columns: 1fr !important; }
          .mobile-toggle, .mobile-only { display: inline-flex !important; }
          .sidebar { position: fixed !important; left: 12px; top: 12px; bottom: 12px; width: min(310px, calc(100vw - 24px)); transform: translateX(-120%); z-index: 20; transition: .25s ease; }
          .app-bg .sidebar { height: auto !important; }
        }
      `}</style>
    </div>
  );
}
