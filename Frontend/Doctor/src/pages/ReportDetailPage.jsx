import { Download, FileText, StickyNote } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { reportDetails } from '../data/mockData';

export default function ReportDetailPage() {
  const { id } = useParams();
  const detail = useMemo(() => reportDetails[id] || reportDetails.cbc, [id]);
  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="section-title">{detail.title}</h1>
            <p className="section-subtitle">{detail.patient} · {detail.date} · {detail.category}</p>
          </div>
          <button className="btn btn-secondary"><Download size={16} /> Export</button>
        </div>
        <div className="panel" style={{ minHeight: 420, padding: 26, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--text-light)' }}><FileText size={18} /> Report Preview</div>
          <div style={{ border: '1px dashed var(--border)', borderRadius: 18, minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--text-very-light)' }}>PDF / scan preview area</div>
        </div>
      </section>
      <aside className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Key Measurements</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {detail.values.map(([name, value, status]) => (
              <div key={name} className="panel" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>Latest extracted value</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>{value}</div>
                  <span className={`badge ${status}`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">AI-Powered Insights</h2>
          <div className="panel" style={{ padding: 16, lineHeight: 1.6 }}>{detail.aiSummary}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 8 }}><StickyNote size={17} color="var(--primary)" /> <strong>Clinical Notes</strong></div>
          <div className="panel" style={{ padding: 16, lineHeight: 1.6 }}>{detail.doctorNote}</div>
        </section>
      </aside>
      <style>{`@media (max-width:980px){ .grid[style*='1.2fr .8fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
