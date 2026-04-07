import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealthMeasurements } from '../services/measurementService';
import { getPatientRecords } from '../services/recordService';

const getBadgeClass = (value) => {
  const text = String(value || '').toLowerCase();

  if (text.includes('high') || text.includes('danger') || text.includes('critical')) return 'danger';
  if (text.includes('warn') || text.includes('borderline')) return 'warning';
  return 'success';
};

export default function OverviewPage() {
  const patientId = localStorage.getItem('selectedPatientId');
  const patientName = localStorage.getItem('selectedPatientName') || 'Patient';

  const [measurements, setMeasurements] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorMeasurements, setErrorMeasurements] = useState('');
  const [errorReports, setErrorReports] = useState('');

  useEffect(() => {
    const loadMeasurements = async () => {
      if (!patientId) {
        setErrorMeasurements('No patient selected.');
        setLoadingMeasurements(false);
        return;
      }

      try {
        setLoadingMeasurements(true);
        setErrorMeasurements('');

        const data = await getHealthMeasurements(patientId);
        console.log('Measurements response:', data);

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.measurements)) {
          list = data.measurements;
        }

        setMeasurements(list);
      } catch (err) {
        console.error(err);
        setErrorMeasurements('Could not load health measurements.');
      } finally {
        setLoadingMeasurements(false);
      }
    };

    const loadReports = async () => {
      if (!patientId) {
        setErrorReports('No patient selected.');
        setLoadingReports(false);
        return;
      }

      try {
        setLoadingReports(true);
        setErrorReports('');

        const data = await getPatientRecords(patientId);

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.records)) {
          list = data.records;
        }

        setReports(list.slice(0, 5));
      } catch (err) {
        console.error(err);
        setErrorReports('Could not load reports.');
      } finally {
        setLoadingReports(false);
      }
    };

    loadMeasurements();
    loadReports();
  }, [patientId]);

  const overviewCards = useMemo(() => {
    return [
      { label: 'Selected Patient', value: patientName },
      { label: 'Measurements Loaded', value: measurements.length },
      { label: 'Reports Loaded', value: reports.length },
      { label: 'Session Status', value: patientId ? 'Ready' : 'No patient selected' },
    ];
  }, [patientId, patientName, measurements.length, reports.length]);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.15fr .85fr' }}>
      <section className="grid">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: 6 }}>{patientName}</h1>
              <p className="section-subtitle">Patient overview from backend data</p>
            </div>
            <span className="badge primary">
              {patientId ? 'Patient selected' : 'No patient selected'}
            </span>
          </div>

          <div
            className="grid"
            style={{
              marginTop: 18,
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}
          >
            {overviewCards.map((item) => (
              <div key={item.label} className="panel kpi">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Health Measurements</h2>

          {loadingMeasurements && (
            <div style={{ marginTop: 14 }}>
              Loading measurements...
            </div>
          )}

          {errorMeasurements && (
            <div style={{ marginTop: 14, color: 'tomato' }}>
              {errorMeasurements}
            </div>
          )}

          {!loadingMeasurements && !errorMeasurements && (
            <div
              className="grid"
              style={{
                marginTop: 14,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              {measurements.length === 0 ? (
                <div className="panel" style={{ padding: 18 }}>
                  No health measurements found.
                </div>
              ) : (
                measurements.map((item, index) => {
                  const title =
                    item?.title ||
                    item?.name ||
                    item?.measurement_name ||
                    item?.type ||
                    `Measurement ${index + 1}`;

                  const value =
                    item?.value ||
                    item?.result ||
                    item?.measurement_value ||
                    item?.reading ||
                    '-';

                  const status =
                    item?.status ||
                    item?.flag ||
                    item?.condition ||
                    'normal';

                  return (
                    <div key={item?.id || item?._id || index} className="panel" style={{ padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontWeight: 700 }}>{title}</span>
                        <span className={`badge ${getBadgeClass(status)}`}>{status}</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h2 className="section-title">Recent Reports</h2>
          <Link className="btn btn-secondary" to="/reports">View All</Link>
        </div>

        {loadingReports && (
          <div style={{ marginTop: 14 }}>
            Loading reports...
          </div>
        )}

        {errorReports && (
          <div style={{ marginTop: 14, color: 'tomato' }}>
            {errorReports}
          </div>
        )}

        {!loadingReports && !errorReports && (
          <div className="grid" style={{ marginTop: 14 }}>
            {reports.length === 0 ? (
              <div className="panel" style={{ padding: 16 }}>
                No recent reports found.
              </div>
            ) : (
              reports.map((report, index) => {
                const reportId = report?.id || report?._id || index;
                const title = report?.title || report?.name || report?.document_name || 'Untitled Report';
                const type = report?.type || report?.category || 'Report';
                const date = report?.date || report?.createdAt || report?.uploadedAt || '-';
                const status = report?.status || report?.flag || 'normal';

                return (
                  <Link to={`/reports/${reportId}`} key={reportId} className="panel" style={{ padding: 16, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>{title}</div>
                      <span className={`badge ${getBadgeClass(status)}`}>{status}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 14 }}>
                      {type} · {date}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => {
              localStorage.removeItem('selectedPatientId');
              localStorage.removeItem('selectedPatientName');
              window.location.href = '/access';
            }}
          >
            Change Patient
          </button>

          <Link to="/reports" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
            Open Reports
          </Link>
        </div>
      </aside>

      <style>{`@media (max-width:980px){ .grid[style*='1.15fr .85fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}