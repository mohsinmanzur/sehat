import { Link } from 'react-router-dom';
import { patientSummary, reports } from '../data/mockData';

const statusClass = { success: 'success', warning: 'warning', danger: 'danger' };

export default function OverviewPage() {
  return (
    <div className="grid" style={{ gridTemplateColumns: '1.15fr .85fr' }}>
      <section className="grid">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: 6 }}>{patientSummary.name}</h1>
              <p className="section-subtitle">{patientSummary.age} years · {patientSummary.gender} · Blood Group {patientSummary.bloodGroup}</p>
            </div>
            <span className="badge primary">Access ends in {patientSummary.accessTimer}</span>
          </div>
          <div className="grid" style={{ marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {patientSummary.overview.map((item) => (
              <div key={item.label} className="panel kpi">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Health Insights</h2>
          <div className="grid" style={{ marginTop: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {patientSummary.insights.map((item) => (
              <div key={item.title} className="panel" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontWeight: 700 }}>{item.title}</span>
                  <span className={`badge ${statusClass[item.status]}`}>{item.status}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <aside className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h2 className="section-title">Recent Reports</h2>
          <Link className="btn btn-secondary" to="/reports">View All</Link>
        </div>
        <div className="grid" style={{ marginTop: 14 }}>
          {reports.map((report) => (
            <Link to={`/reports/${report.id}`} key={report.id} className="panel" style={{ padding: 16, display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{report.title}</div>
                <span className={`badge ${statusClass[report.status]}`}>{report.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 14 }}>{report.type} · {report.date}</div>
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }}>End Session</button>
          <button className="btn btn-primary" style={{ flex: 1 }}>Open Reports</button>
        </div>
      </aside>
      <style>{`@media (max-width:980px){ .grid[style*='1.15fr .85fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
