import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatientRecords } from '../services/recordService';

type RecordItem = {
  id?: string;
  file_name?: string;
  file_url?: string;
  record_type?: string;
  ocr_extracted_text?: string;
  date_issued?: string;
  created_at?: string;
};

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function ReportsPage() {
  const patientId = localStorage.getItem('selectedPatientId') || '';
  const patientName = localStorage.getItem('selectedPatientName') || 'Selected Patient';

  const [reports, setReports] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await getPatientRecords(patientId);
        setReports(toArray(res));
      } catch (err) {
        console.error(err);
        setError('Could not load reports.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h1 className="section-title">Reports</h1>
          <p className="section-subtitle">No patient selected yet.</p>

          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            Please select a patient from Access Patient first.
          </div>

          <Link to="/access" className="btn btn-primary" style={{ width: 'fit-content', marginTop: 18 }}>
            Go to Access Patient
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 className="section-title">Reports</h1>
            <p className="section-subtitle">{patientName}</p>
          </div>

          <div className="badge primary">
            {loading ? 'Loading...' : `${reports.length} Report${reports.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {loading && (
          <div className="grid" style={{ marginTop: 20 }}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="panel" style={{ padding: 16, minHeight: 90 }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="panel" style={{ padding: 16, marginTop: 20, color: 'tomato' }}>
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 20 }}>
            No reports were found for this patient.
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="grid" style={{ marginTop: 20 }}>
            {reports.map((report) => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="panel"
                style={{
                  padding: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {report.file_name || 'Medical Report'}
                    </div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {(report.record_type || 'other').replaceAll('_', ' ')} · {formatDate(report.date_issued || report.created_at)}
                    </div>
                  </div>
                </div>

                <div className="badge primary">Open</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}