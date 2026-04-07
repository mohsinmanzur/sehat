import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { requestCode, verifyCode } from '../services/authService';

export default function VerifyPage() {
  const { email, verify, setDoctorName } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setTimer((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const update = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);

    if (clean && refs.current[index + 1]) {
      refs.current[index + 1].focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const code = otp.join('');

    try {
      setLoading(true);
      setError('');

      const data = await verifyCode(email, code);
      console.log('Verify response:', data);

      const token = data?.accessToken || data?.token || data?.jwt;
      if (token) {
        localStorage.setItem('doctorToken', token);
      }

      const doctor =
        data?.doctor ||
        data?.user ||
        data?.data?.doctor ||
        data?.data?.user;

      if (doctor?.name) {
        setDoctorName(doctor.name);
      } else if (doctor?.fullName) {
        setDoctorName(doctor.fullName);
      }

      verify();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('OTP is wrong or verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      await requestCode(email);
      setTimer(60);
    } catch (err) {
      console.error(err);
      setError('Could not resend code.');
    }
  };

  return (
    <AuthShell>
      <div style={{ width: 'min(100%, 560px)', display: 'grid', gap: 18 }}>
        <section className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 22,
              background: 'var(--primary-soft)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 18px',
            }}
          >
            <Lock size={30} color="var(--primary)" />
          </div>

          <h1 className="section-title">Verify Your Identity</h1>
          <p className="section-subtitle">Enter the 6-digit code sent to your email</p>
          <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 8 }}>{email}</div>

          <form onSubmit={submit} style={{ marginTop: 28, display: 'grid', gap: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (refs.current[index] = el)}
                  className="input"
                  value={digit}
                  onChange={(e) => update(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && refs.current[index - 1]) {
                      refs.current[index - 1].focus();
                    }
                  }}
                  style={{
                    width: 56,
                    height: 64,
                    textAlign: 'center',
                    padding: 0,
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ color: 'tomato', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              <span>{loading ? 'Verifying...' : 'Verify Identity'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 20 }}>
            <div className="muted" style={{ marginBottom: 10 }}>Didn’t receive the code?</div>
            <button className="btn btn-secondary" disabled={timer > 0} onClick={handleResend}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
            For testing, you can try OTP: <strong>000000</strong>
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 22,
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

        <section className="panel" style={{ padding: 16, textAlign: 'center' }}>
          <span className="muted" style={{ fontSize: 14 }}>End-to-end encrypted health data</span>
        </section>
      </div>
    </AuthShell>
  );
}