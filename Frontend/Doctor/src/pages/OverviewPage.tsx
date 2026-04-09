import { Activity, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealthMeasurements } from '../services/measurementService';
import { getPatientRecords } from '../services/recordService';

type MeasurementItem = {
  id?: string;
  numeric_value?: number;
  unit?: {
    unit_name?: string;
    symbol?: string;
  };
  created_at?: string;
  special_condition?: string;
  ai_insight?: string | null;
  anomaly_detected?: boolean;
  severity_score?: number;
  min_value?: number;
  max_value?: number;
};

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

const getMeasurementStatus = (item: MeasurementItem) => {
  if (item.anomaly_detected) return 'danger';

  const value = Number(item.numeric_value);
  const min = Number(item.min_value);
  const max = Number(item.max_value);

  if (!Number.isNaN(value) && !Number.isNaN(min) && !Number.isNaN(max) && (min !== 0 || max !== 0)) {
    if (value < min || value > max) return 'warning';
    return 'success';
  }

  if ((item.severity_score || 0) > 0) return 'warning';

  return 'primary';
};

export default function OverviewPage() {
  const patientId = localStorage.getItem('selectedPatientId') || '';
  const patientName = localStorage.getItem('selectedPatientName') || 'Selected Patient';

  const [measurements, setMeasurements] = useState<MeasurementItem[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [measurementError, setMeasurementError] = useState('');
  const [recordError, setRecordError] = useState('');

  useEffect(() => {
    const loadMeasurements = async () => {
      if (!patientId) {
        setMeasurements([]);
        setLoadingMeasurements(false);
        return;
      }

      try {
        setLoadingMeasurements(true);
        setMeasurementError('');
        const res = await getHealthMeasurements(patientId);
        setMeasurements(toArray(res));
      } catch (err) {
        console.error('Failed to load measurements:', err);
        setMeasurementError('Could not load health measurements.');
      } finally {
        setLoadingMeasurements(false);
      }
    };

    const loadRecords = async () => {
      if (!patientId) {
        setRecords([]);
        setLoadingRecords(false);
        return;
      }

      try {
        setLoadingRecords(true);
        setRecordError('');
        const res = await getPatientRecords(patientId);
        setRecords(toArray(res));
      } catch (err) {
        console.error('Failed to load records:', err);
        setRecordError('Could not load reports.');
      } finally {
        setLoadingRecords(false);
      }
    };

    loadMeasurements();
    loadRecords();
  }, [patientId]);

  const latestMeasurement = useMemo(() => {
    if (!measurements.length) return null;
    return measurements[0];
  }, [measurements]);

  const abnormalCount = useMemo(() => {
    return measurements.filter((item) => item.anomaly_detected).length;
  }, [measurements]);

  if (!patientId) {
    return (
      <div className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h1 className="section-title">Patient Overview</h1>
          <p className="section-subtitle">No patient is selected yet.</p>

          <div className="panel" style={{ padding: 18, marginTop: 20 }}>
            Please go to <strong>Access Patient</strong> first and select a patient.
          </div>

          <Link to="/access" className="btn btn-primary" style={{ width: 'fit-content', marginTop: 18 }}>
            Go to Access Patient
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">{patientName}</h1>
        <p className="section-subtitle">Health Overview</p>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20, gap: 16 }}>
          <div className="dashboard-stat-panel dashboard-stat-panel-primary">
            <div className="dashboard-stat-icon">
              <Activity size={18} />
            </div>
            <div className="dashboard-stat-label">Measurements stored</div>
            <div className="dashboard-stat-value">
              {loadingMeasurements ? '...' : measurements.length}
            </div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon">
              <FileText size={18} />
            </div>
            <div className="dashboard-stat-label">Reports stored</div>
            <div className="dashboard-stat-value">
              {loadingRecords ? '...' : records.length}
            </div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon warning">
              <AlertTriangle size={18} />
            </div>
            <div className="dashboard-stat-label">Flagged anomalies</div>
            <div className="dashboard-stat-value">
              {loadingMeasurements ? '...' : abnormalCount}
            </div>
          </div>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: '1.15fr 0.85fr', gap: 20 }}>
        <section className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 className="section-title">Stored Results</h2>
              <p className="section-subtitle">Measurements pulled from backend</p>
            </div>

            <Link to="/reports" className="btn btn-secondary">
              View All Reports
            </Link>
          </div>

          {loadingMeasurements && (
            <div className="grid" style={{ marginTop: 18 }}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="panel" style={{ padding: 18, minHeight: 88 }} />
              ))}
            </div>
          )}

          {!loadingMeasurements && measurementError && (
            <div className="panel" style={{ padding: 16, marginTop: 18, color: 'tomato' }}>
              {measurementError}
            </div>
          )}

          {!loadingMeasurements && !measurementError && measurements.length === 0 && (
            <div className="panel" style={{ padding: 16, marginTop: 18 }}>
              No health measurements were found for this patient.
            </div>
          )}

          {!loadingMeasurements && !measurementError && measurements.length > 0 && (
            <div className="grid" style={{ marginTop: 18 }}>
              {measurements.map((item) => {
                const status = getMeasurementStatus(item);

                return (
                  <div
                    key={item.id || `${item.unit?.unit_name}-${item.created_at}`}
                    className="panel"
                    style={{
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>
                        {item.unit?.unit_name || 'Measurement'}
                      </div>

                      <div className="muted" style={{ marginTop: 4 }}>
                        {formatDate(item.created_at)}
                      </div>

                      {item.special_condition && (
                        <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                          Condition: {item.special_condition}
                        </div>
                      )}

                      {item.ai_insight && (
                        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6 }}>
                          {item.ai_insight}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                        {item.numeric_value ?? '-'}
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {item.unit?.symbol || ''}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span className={`badge ${status}`}>
                          {status === 'danger'
                            ? 'Abnormal'
                            : status === 'warning'
                            ? 'Review'
                            : status === 'success'
                            ? 'Normal'
                            : 'Stored'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="grid">
          <section className="card" style={{ padding: 24 }}>
            <h2 className="section-title">Latest Reading</h2>

            {loadingMeasurements && (
              <div className="panel" style={{ padding: 18, marginTop: 16, minHeight: 140 }} />
            )}

            {!loadingMeasurements && !latestMeasurement && (
              <div className="panel" style={{ padding: 16, marginTop: 16 }}>
                No recent reading available.
              </div>
            )}

            {!loadingMeasurements && latestMeasurement && (
              <div className="panel" style={{ padding: 18, marginTop: 16 }}>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {latestMeasurement.unit?.unit_name || 'Measurement'}
                </div>

                <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>
                  {latestMeasurement.numeric_value ?? '-'}
                </div>

                <div className="muted" style={{ marginTop: 8 }}>
                  {latestMeasurement.unit?.symbol || ''} · {formatDate(latestMeasurement.created_at)}
                </div>

                {latestMeasurement.ai_insight && (
                  <div style={{ marginTop: 14, lineHeight: 1.6 }}>
                    {latestMeasurement.ai_insight}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <h2 className="section-title" style={{ fontSize: 28 }}>Recent Reports</h2>
            </div>

            {loadingRecords && (
              <div className="grid" style={{ marginTop: 16 }}>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="panel" style={{ padding: 16, minHeight: 72 }} />
                ))}
              </div>
            )}

            {!loadingRecords && recordError && (
              <div className="panel" style={{ padding: 16, marginTop: 16, color: 'tomato' }}>
                {recordError}
              </div>
            )}

            {!loadingRecords && !recordError && records.length === 0 && (
              <div className="panel" style={{ padding: 16, marginTop: 16 }}>
                No reports found for this patient.
              </div>
            )}

            {!loadingRecords && !recordError && records.length > 0 && (
              <div className="grid" style={{ marginTop: 16 }}>
                {records.slice(0, 3).map((record) => (
                  <Link
                    key={record.id}
                    to={`/reports/${record.id}`}
                    className="panel"
                    style={{
                      padding: 16,
                      display: 'block',
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {record.file_name || 'Medical Report'}
                    </div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {record.record_type || 'other'} · {formatDate(record.date_issued || record.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .grid[style*='repeat(3, 1fr)'] {
            grid-template-columns: 1fr !important;
          }

          .grid[style*='1.15fr 0.85fr'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}