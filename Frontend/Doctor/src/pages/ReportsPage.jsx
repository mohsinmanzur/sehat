import { Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reports } from '../data/mockData';

export default function ReportsPage() {
  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h1 className="section-title">Medical Reports</h1>
            <p className="section-subtitle">Browse shared reports by type, date, or review priority.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', top: 15, left: 14, color: 'var(--muted)' }} />
              <input className="input" placeholder="Search reports" style={{ paddingLeft: 40 }} />
            </div>
            <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
          </div>
        </div>
        <div className="grid" style={{ marginTop: 18 }}>
          {reports.map((report) => (
            <div key={report.id} className="panel" style={{ padding: 16, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{report.title}</div>
                <div className="muted" style={{ fontSize: 14 }}>{report.patient}</div>
              </div>
              <div className="muted">{report.type}</div>
              <div className="muted">{report.date}</div>
              <Link to={`/reports/${report.id}`} className="btn btn-primary" style={{ padding: '10px 14px' }}>View</Link>
            </div>
          ))}
        </div>
      </section>
      <style>{`@media (max-width:780px){ .panel[style*='grid-template-columns: 2fr 1fr 1fr auto']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
