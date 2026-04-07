import { Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getPatientRecords } from '../services/recordService';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const patientId = localStorage.getItem('selectedPatientId');
  const patientName = localStorage.getItem('selectedPatientName') || 'Patient';

  useEffect(() => {
    const loadReports = async () => {
      if (!patientId) {
        setError('No patient selected. Please go to Access Patient page first.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getPatientRecords(patientId);
        console.log('Reports response:', data);

        let reportList = [];

        if (Array.isArray(data)) {
          reportList = data;
        } else if (Array.isArray(data?.data)) {
          reportList = data.data;
        } else if (Array.isArray(data?.records)) {
          reportList = data.records;
        }

        setReports(reportList);
      } catch (err) {
        console.error(err);
        setError('Could not load reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [patientId]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return reports;

    return reports.filter((report) => {
      const title = report?.title || report?.name || report?.document_name || '';
      const type = report?.type || report?.category || '';
      return title.toLowerCase().includes(term) || type.toLowerCase().includes(term);
    });
  }, [reports, search]);

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 className="section-title">Medical Reports</h1>
            <p className="section-subtitle">Browse shared reports by type, date, or review priority.</p>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              Selected patient: <strong>{patientName}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', top: 15, left: 14, color: 'var(--muted)' }} />
              <input
                className="input"
                placeholder="Search reports"
                style={{ paddingLeft: 40 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="btn btn-secondary">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ marginTop: 18 }}>
            Loading reports...
          </div>
        )}

        {error && (
          <div style={{ marginTop: 18, color: 'tomato' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid" style={{ marginTop: 18 }}>
            {filteredReports.length === 0 ? (
              <div className="panel" style={{ padding: 16 }}>
                No reports found for this patient.
              </div>
            ) : (
              filteredReports.map((report, index) => {
                const reportId = report?.id || report?._id || index;
                const title = report?.title || report?.name || report?.document_name || 'Untitled Report';
                const type = report?.type || report?.category || 'Report';
                const date = report?.date || report?.createdAt || report?.uploadedAt || '-';

                return (
                  <div
                    key={reportId}
                    className="panel"
                    style={{
                      padding: 16,
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{title}</div>
                      <div className="muted" style={{ fontSize: 14 }}>{patientName}</div>
                    </div>

                    <div className="muted">{type}</div>
                    <div className="muted">{date}</div>

                    <Link to={`/reports/${reportId}`} className="btn btn-primary" style={{ padding: '10px 14px' }}>
                      View
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <style>{`@media (max-width:780px){ .panel[style*='grid-template-columns: 2fr 1fr 1fr auto']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}