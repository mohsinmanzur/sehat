import { Activity, ArrowRight, FolderOpen, QrCode, ShieldCheck, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notifications, sessions } from '../data/mockData';

export default function DashboardPage() {
  return (
    <div className="grid">
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { title: 'Enter Patient OTP', note: 'Start a temporary session securely.', icon: ShieldCheck, action: '/access' },
          { title: 'Scan QR', note: 'Use the patient QR for instant access.', icon: QrCode, action: '/access' },
          { title: 'Open Reports', note: 'Review latest lab and imaging records.', icon: FolderOpen, action: '/reports' },
        ].map((item) => (
          <Link key={item.title} to={item.action} className="card" style={{ padding: 22 }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 16 }}><item.icon size={24} /></div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.title}</div>
            <div className="muted" style={{ lineHeight: 1.5 }}>{item.note}</div>
          </Link>
        ))}
      </section>

      <section className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 className="section-title">Active Sessions</h2>
              <p className="section-subtitle">Current patients you can review right now.</p>
            </div>
            <Link to="/sessions" className="btn btn-secondary">See all</Link>
          </div>
          <div className="grid">
            {sessions.map((session) => (
              <div key={session.id} className="panel" style={{ padding: 18, display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{session.patient}</div>
                    <div className="muted" style={{ fontSize: 14 }}>{session.specialty}</div>
                  </div>
                  <span className={`badge ${session.status}`}>{session.remaining}</span>
                </div>
                <div className="muted" style={{ fontSize: 14 }}>{session.insights}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span className="badge primary">{session.access}</span>
                  <Link to="/overview" className="btn btn-primary" style={{ padding: '10px 14px' }}>View Patient <ArrowRight size={14} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid">
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">Patient Insights</h2>
            <p className="section-subtitle">Fast clinical context without overwhelming detail.</p>
            <div className="grid" style={{ marginTop: 16 }}>
              <div className="panel kpi" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, white))', color: '#fff' }}>
                <Activity size={20} />
                <span style={{ display: 'block', opacity: .88, marginTop: 12 }}>Patients flagged today</span>
                <strong>3</strong>
              </div>
              <div className="panel kpi">
                <Timer size={18} color="var(--warning)" />
                <span className="muted">Sessions expiring soon</span>
                <strong>2</strong>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">Recent Alerts</h2>
            <div className="grid" style={{ marginTop: 12 }}>
              {notifications.map((item) => (
                <div key={item} className="panel" style={{ padding: 14, lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style>{`@media (max-width: 980px){ .grid[style*='1.5fr 1fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
