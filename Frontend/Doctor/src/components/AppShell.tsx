import {
  Bell,
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  TimerReset,
  UserRound,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMemo, useState } from 'react';
import Logo from './Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/access', label: 'Access Patient', icon: ClipboardPlus },
  { to: '/overview', label: 'Patient Overview', icon: UserRound },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/sessions', label: 'Sessions', icon: TimerReset },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const pageMeta: Record<string, { eyebrow: string; title: string }> = {
  '/dashboard': { eyebrow: 'Welcome back', title: 'Dashboard' },
  '/access': { eyebrow: 'Welcome back', title: 'Access Patient' },
  '/overview': { eyebrow: 'Welcome back', title: 'Patient Overview' },
  '/reports': { eyebrow: 'Welcome back', title: 'Reports' },
  '/sessions': { eyebrow: 'Welcome back', title: 'Sessions' },
  '/settings': { eyebrow: 'Welcome back', title: 'Settings' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleTheme } = useTheme();
  const { doctorName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const currentMeta = useMemo(() => {
    return pageMeta[location.pathname] || {
      eyebrow: 'Welcome back',
      title: 'Dashboard',
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openOtpModal = () => {
    window.dispatchEvent(new CustomEvent('open-patient-otp-modal'));
  };

  const alerts = [
    'Session for Emily Davis expires in 9 minutes.',
    'New CBC report shared by Rajesh Kumar Sharma.',
    'Two abnormal findings require review today.',
  ];

  return (
    <div className="app-bg mobile-bottom-space">
      <div className="container" style={{ padding: '12px 0 24px' }}>
        <div className="shell-grid-premium">
          <aside className={`card sidebar-premium ${open ? 'open' : ''}`}>
            <div className="sidebar-top">
              <Logo compact />
              <button className="btn btn-secondary sidebar-close" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="panel sidebar-user-card">
              <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Signed in as
              </div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{doctorName}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                SehatScan doctor portal
              </div>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <button className="btn btn-secondary sidebar-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <main className="shell-main">
            <header className="card shell-header-clean">
              <div className="shell-header-left">
                <button className="btn btn-secondary mobile-menu-btn" onClick={() => setOpen(true)}>
                  <Menu size={18} />
                </button>

                <div>
                  <div className="shell-eyebrow">{currentMeta.eyebrow}</div>
                  <div className="shell-title-custom">Hello, {doctorName}</div>
                </div>
              </div>

              <div className="shell-header-actions">
                <button
                  type="button"
                  className="btn btn-primary shell-top-cta"
                  onClick={openOtpModal}
                >
                  <ClipboardPlus size={18} />
                  Enter Patient OTP
                </button>

                <button className="btn btn-secondary icon-btn" onClick={toggleTheme}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="alerts-anchor">
                  <button
                    className="btn btn-secondary icon-btn"
                    onClick={() => setShowAlerts((prev) => !prev)}
                  >
                    <Bell size={18} />
                  </button>

                  {showAlerts && (
                    <div className="alerts-dropdown card">
                      <div className="alerts-head">Recent Alerts</div>
                      <div className="alerts-list">
                        {alerts.map((alert) => (
                          <div key={alert} className="panel alerts-item">
                            {alert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      {showAlerts && <div className="alerts-overlay" onClick={() => setShowAlerts(false)} />}
    </div>
  );
}