import { Bell, Moon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  DoctorNotification,
} from '../utils/notifications';

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const { doctorFullName, doctorEmail, doctorHospital, updateDoctorProfileLocal } = useAuth();

  const [email, setEmail] = useState('');
  const [hospital, setHospital] = useState('');
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState<DoctorNotification[]>([]);

  useEffect(() => {
    setEmail(doctorEmail || '');
    setHospital(doctorHospital || '');
  }, [doctorEmail, doctorHospital]);

  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotifications());
    };

    loadNotifications();
    window.addEventListener('doctor-notifications-updated', loadNotifications);

    return () => {
      window.removeEventListener('doctor-notifications-updated', loadNotifications);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleSave = () => {
    updateDoctorProfileLocal({
      email,
      hospital,
    });

    setSuccess('Changes saved locally.');

    setTimeout(() => {
      setSuccess('');
    }, 2000);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  const handleClearAlerts = () => {
    const confirmed = window.confirm('Are you sure you want to clear all alerts?');
    if (!confirmed) return;

    clearNotifications();
    setNotifications([]);
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Profile</h1>

        <div className="grid" style={{ marginTop: 16 }}>
          <div
            className="panel"
            style={{
              padding: 16,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: 'var(--primary-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--primary)',
              }}
            >
              <User size={22} />
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>
                {doctorFullName ? `Dr. ${doctorFullName}` : 'Dr. Doctor'}
              </div>
              <div className="muted">{doctorHospital || ''}</div>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Doctor Email
            </label>

            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Hospital / Clinic
            </label>

            <input
              className="input"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Enter hospital or clinic"
            />
          </div>

          {success && <div style={{ color: 'var(--success)', fontSize: 14 }}>{success}</div>}

          <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </section>

      <section className="grid">
        <div className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Preferences</h2>

          <div
            className="panel"
            style={{
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Moon size={18} color="var(--primary)" />

              <div>
                <div style={{ fontWeight: 700 }}>Dark Mode</div>
                <div className="muted" style={{ fontSize: 14 }}>
                  Improve contrast for long review sessions.
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={toggleTheme}>
              {darkMode ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 className="section-title">Notifications</h2>
              <p className="section-subtitle">
                Manage doctor portal alerts and patient session updates.
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="badge danger">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div
            className="panel"
            style={{
              padding: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Bell size={18} color="var(--primary)" />
            <span className="muted">
              Session started alerts, shared report alerts, measurement alerts, and revoke updates.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleMarkAllRead}>
              Mark All as Read
            </button>

            <button className="btn btn-secondary" onClick={handleClearAlerts}>
              Clear Alerts
            </button>
          </div>

          <div className="grid" style={{ marginTop: 20 }}>
            {notifications.length === 0 && (
              <div className="panel" style={{ padding: 16 }}>
                <div style={{ fontWeight: 900 }}>No alerts yet</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  Patient session updates will appear here.
                </div>
              </div>
            )}

            {notifications.map((item) => (
              <div
                key={item.id}
                className="panel"
                style={{
                  padding: 16,
                  borderColor: item.read ? 'var(--border)' : 'var(--primary)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{item.title}</div>

                  {!item.read && (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: 'var(--primary)',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                <div className="muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  {item.message}
                </div>

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 980px) {
          .grid[style*='1fr 1fr'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}