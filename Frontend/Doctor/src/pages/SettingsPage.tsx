import { Bell, Moon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const {
    doctorFullName,
    doctorEmail,
    doctorHospital,
    updateDoctorProfileLocal,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [hospital, setHospital] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setEmail(doctorEmail || '');
    setHospital(doctorHospital || '');
  }, [doctorEmail, doctorHospital]);

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

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Profile</h1>

        <div className="grid" style={{ marginTop: 16 }}>
          <div
            className="panel"
            style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}
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
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
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
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Hospital / Clinic
            </label>
            <input
              className="input"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Enter hospital or clinic"
            />
          </div>

          {success && <div style={{ color: '#4ade80', fontSize: 14 }}>{success}</div>}

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
          <h2 className="section-title">Notifications</h2>
          <div
            className="panel"
            style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}
          >
            <Bell size={18} color="var(--primary)" />
            <span className="muted">
              Session expiry alerts, new report alerts, and urgent findings.
            </span>
          </div>

          <button className="btn btn-secondary" style={{ marginTop: 16 }}>
            Manage Alerts
          </button>
        </div>
      </section>

      <style>{`
        @media (max-width:980px){
          .grid[style*='1fr 1fr']{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}