import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { registerDoctor, verifyDoctorAccount } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function RegisterDoctorPage() {
  const navigate = useNavigate();
  const { setDoctorProfile } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    license_number: '',
    associated_hospital: '',
    specialization: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await registerDoctor(form);

      try {
        await verifyDoctorAccount(form.email);
      } catch (verifyErr) {
        console.error('Doctor verification warning:', verifyErr);
      }

      setDoctorProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
      });

      setSuccess('Doctor registered successfully. You can now log in.');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      console.error(err);

      if (err.response) {
        setError(err.response.data?.message || `Backend error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from backend.');
      } else {
        setError(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div style={{ width: 'min(100%, 640px)', display: 'grid', gap: 18 }}>
        <section className="card" style={{ padding: 32 }}>
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

            <h1 className="section-title" style={{ marginBottom: 8 }}>
              Register Doctor
            </h1>
            <p className="section-subtitle">
              Create your doctor account to access Sehat Scan
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              <input
                className="input"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
              />

              <input
                className="input"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
              />
            </div>

            <input
              className="input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />

            <input
              className="input"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <input
              className="input"
              placeholder="License Number"
              value={form.license_number}
              onChange={(e) => updateField('license_number', e.target.value)}
            />

            <input
              className="input"
              placeholder="Associated Hospital (optional)"
              value={form.associated_hospital}
              onChange={(e) => updateField('associated_hospital', e.target.value)}
            />

            <input
              className="input"
              placeholder="Specialization (optional)"
              value={form.specialization}
              onChange={(e) => updateField('specialization', e.target.value)}
            />

            {error && (
              <div style={{ color: 'tomato', fontSize: 14 }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: '#4ade80', fontSize: 14 }}>
                {success}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              <span>{loading ? 'Registering...' : 'Create Doctor Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 18,
              border: 0,
              background: 'transparent',
              color: 'var(--text-light)',
              display: 'inline-flex',
              gap: 8,
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back to login
          </button>
        </section>

        <style>{`
          @media (max-width: 700px) {
            form > div:first-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </AuthShell>
  );
}