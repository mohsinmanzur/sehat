import { ClipboardPlus, QrCode, Users, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPatients } from '../services/patientService';
import { getPatientRecords } from '../services/recordService';
import { getHealthMeasurements } from '../services/measurementService';

export default function DashboardPage() {
  const [patientCount, setPatientCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [measurementCount, setMeasurementCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError('');

        const [patientsRes, reportsRes, measurementsRes] = await Promise.all([
          getPatients(),
          getPatientRecords(),
          getHealthMeasurements(),
        ]);

        console.log('Patients response:', patientsRes);
        console.log('Reports response:', reportsRes);
        console.log('Measurements response:', measurementsRes);

        let patients = [];
        let reports = [];
        let measurements = [];

        if (Array.isArray(patientsRes)) patients = patientsRes;
        else if (Array.isArray(patientsRes?.data)) patients = patientsRes.data;
        else if (Array.isArray(patientsRes?.patients)) patients = patientsRes.patients;

        if (Array.isArray(reportsRes)) reports = reportsRes;
        else if (Array.isArray(reportsRes?.data)) reports = reportsRes.data;
        else if (Array.isArray(reportsRes?.records)) reports = reportsRes.records;

        if (Array.isArray(measurementsRes)) measurements = measurementsRes;
        else if (Array.isArray(measurementsRes?.data)) measurements = measurementsRes.data;
        else if (Array.isArray(measurementsRes?.measurements)) {
          measurements = measurementsRes.measurements;
        }

        setPatientCount(patients.length);
        setReportCount(reports.length);
        setMeasurementCount(measurements.length);
      } catch (err: any) {
        console.error(err);
        setError('Could not load dashboard insights.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  return (
    <div className="dashboard-clean">
      <section className="dashboard-actions-grid">
        <Link to="/access" className="dashboard-action-card card">
          <div className="dashboard-action-icon">
            <ClipboardPlus size={24} />
          </div>
          <h2>Enter Patient OTP</h2>
          <p>Start a secure temporary access session using the patient OTP.</p>
        </Link>

        <Link to="/access" className="dashboard-action-card card">
          <div className="dashboard-action-icon">
            <QrCode size={24} />
          </div>
          <h2>Scan QR</h2>
          <p>Use the patient QR for quick access without extra steps.</p>
        </Link>
      </section>

      <section className="card dashboard-insights-card">
        <div className="dashboard-section-head">
          <div>
            <h2 className="section-title">Patient Insights</h2>
            <p className="section-subtitle">
              Quick context for today.
            </p>
          </div>
        </div>

        {loading && (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading patient insights...
          </div>
        )}

        {error && (
          <div style={{ color: 'tomato', marginTop: 10 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="dashboard-insights-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="dashboard-stat-panel dashboard-stat-panel-primary">
              <div className="dashboard-stat-icon">
                <Users size={18} />
              </div>
              <div className="dashboard-stat-label">Patients in system</div>
              <div className="dashboard-stat-value">{patientCount}</div>
            </div>

            <div className="dashboard-stat-panel">
              <div className="dashboard-stat-icon">
                <FileText size={18} />
              </div>
              <div className="dashboard-stat-label">Reports available</div>
              <div className="dashboard-stat-value">{reportCount}</div>
            </div>

            <div className="dashboard-stat-panel">
              <div className="dashboard-stat-icon">
                <Activity size={18} />
              </div>
              <div className="dashboard-stat-label">Measurements tracked</div>
              <div className="dashboard-stat-value">{measurementCount}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}