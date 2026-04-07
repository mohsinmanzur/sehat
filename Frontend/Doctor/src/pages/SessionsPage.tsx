import { Link } from 'react-router-dom';
import { sessions } from '../data/mockData';

export default function SessionsPage() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 className="section-title">Active Sessions</h1>
      <p className="section-subtitle">Monitor time-limited patient access and end sessions when needed.</p>
      <div className="grid" style={{ marginTop: 16 }}>
        {sessions.map((session) => (
          <div key={session.id} className="panel" style={{ padding: 18, display: 'grid', gridTemplateColumns: '1.3fr 1fr auto', gap: 14, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{session.patient}</div>
              <div className="muted">{session.specialty}</div>
            </div>
            <div>
              <span className={`badge ${session.status}`}>{session.remaining}</span>
              <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>{session.access}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link className="btn btn-primary" to="/overview" style={{ padding: '10px 14px' }}>View</Link>
              <button className="btn btn-secondary" style={{ padding: '10px 14px' }}>End Session</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
