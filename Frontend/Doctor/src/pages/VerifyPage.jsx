import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

export default function VerifyPage() {
  const { email, verify } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
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
    if (clean && refs.current[index + 1]) refs.current[index + 1].focus();
  };

  const submit = (e) => {
    e.preventDefault();
    verify();
    navigate('/dashboard');
  };

  return (
    <AuthShell>
      <div style={{ width: 'min(100%, 560px)', display: 'grid', gap: 18 }}>
        <section className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}><Lock size={30} color="var(--primary)" /></div>
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
                    if (e.key === 'Backspace' && !otp[index] && refs.current[index - 1]) refs.current[index - 1].focus();
                  }}
                  style={{ width: 56, height: 64, textAlign: 'center', padding: 0, fontSize: 22, fontWeight: 800 }}
                />
              ))}
            </div>
            <button className="btn btn-primary" type="submit"><span>Verify Identity</span><ArrowRight size={16} /></button>
          </form>
          <div style={{ marginTop: 20 }}>
            <div className="muted" style={{ marginBottom: 10 }}>Didn’t receive the code?</div>
            <button className="btn btn-secondary" disabled={timer > 0}>{timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}</button>
          </div>
          <button onClick={() => navigate('/login')} style={{ marginTop: 22, border: 0, background: 'transparent', color: 'var(--text-light)', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}><ArrowLeft size={16} /> Back to login</button>
        </section>
        <section className="panel" style={{ padding: 16, textAlign: 'center' }}>
          <span className="muted" style={{ fontSize: 14 }}>End-to-end encrypted health data</span>
        </section>
      </div>
    </AuthShell>
  );
}
