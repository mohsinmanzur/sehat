import { KeyRound, QrCode, Shield, Smartphone } from 'lucide-react';

export default function AccessPage() {
  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Access Patient Records</h1>
        <p className="section-subtitle">Choose a secure method to start a temporary review session.</p>
        <div className="grid" style={{ marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 14 }}><Shield size={22} /></div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Enter OTP</div>
            <input className="input" placeholder="6-digit patient OTP" />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>Verify OTP</button>
          </div>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 14 }}><QrCode size={22} /></div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Scan QR Code</div>
            <div className="panel" style={{ minHeight: 140, display: 'grid', placeItems: 'center', background: 'var(--surface)' }}><QrCode size={72} color="var(--text-very-light)" /></div>
            <div className="muted" style={{ fontSize: 14, marginTop: 12 }}>Point your device at the patient’s QR to open a session.</div>
          </div>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 14 }}><KeyRound size={22} /></div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Enter Access Code</div>
            <input className="input" placeholder="Paste secure share token" />
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 14 }}>Validate Token</button>
          </div>
        </div>
      </section>
      <aside className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Temporary Access Control</h2>
          <div className="panel" style={{ padding: 16, marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}><Smartphone size={18} /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Patient-controlled sharing</div>
                <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>Doctors only see data while the patient’s consent session remains active.</div>
              </div>
            </div>
          </div>
        </section>
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Recent Access Requests</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {['Ali Raza · Approved 10 min ago', 'Mina Joseph · QR scanned 25 min ago', 'Usman Tariq · Expired 1 hr ago'].map((item) => (
              <div key={item} className="panel" style={{ padding: 14 }}>{item}</div>
            ))}
          </div>
        </section>
      </aside>
      <style>{`@media (max-width:980px){ .grid[style*='1.2fr .8fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
