import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { requestCode } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState(localStorage.getItem('doctorEmail') || 'syed.aadil3011@gmail.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

const submit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError('');

    await requestCode(email);
    login(email);
    navigate('/verify');
  } catch (err) {
    console.error("OTP request error:", err);

    if (err.response) {
      console.error("Backend response:", err.response.data);
      setError(`Backend error: ${err.response.status}`);
    } else if (err.request) {
      console.error("No response received:", err.request);
      setError("No response from backend. This is usually a CORS or server issue.");
    } else {
      console.error("Request setup error:", err.message);
      setError(`Error: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthShell>
      <div style={{ width: 'min(100%, 470px)', display: 'grid', gap: 18 }}>
        <section className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, var(--primary), #6f8dff)',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: 'var(--primary-soft)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px',
              }}
            >
              <ShieldCheck color="var(--primary)" size={30} />
            </div>

            <h1 className="section-title" style={{ marginBottom: 8 }}>Welcome to Sehat Scan</h1>
            <p className="section-subtitle">Secure doctor access to patient records</p>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>Email Address</label>

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--muted)' }} />
              <input
                className="input"
                style={{ paddingLeft: 46 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.smith@hospital.com"
              />
            </div>

            {error && (
              <div style={{ color: 'tomato', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              <span>{loading ? 'Sending...' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0 18px',
            }}
          >
            <div style={{ height: 1, background: 'var(--border)' }} />
            <span className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.18em' }}>
              or continue with
            </span>
            <div style={{ height: 1, background: 'var(--border)' }} />
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }}>
            Google Workspace
          </button>
        </section>

        <section className="panel" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'var(--surface)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldCheck size={18} color="var(--success)" />
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>HIPAA Compliant Security</div>
            <div className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>
              All patient data is encrypted, monitored, and protected with enterprise-grade safeguards.
            </div>
          </div>
        </section>
      </div>
    </AuthShell>
  );
}