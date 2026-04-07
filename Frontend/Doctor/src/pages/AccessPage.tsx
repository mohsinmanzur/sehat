import { KeyRound, QrCode, Shield, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../services/patientService';

export default function AccessPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientError, setPatientError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setPatientError('');

        const data = await getPatients();
        console.log('Patients response:', data);

        let patientList = [];

        if (Array.isArray(data)) {
          patientList = data;
        } else if (Array.isArray(data?.data)) {
          patientList = data.data;
        } else if (Array.isArray(data?.patients)) {
          patientList = data.patients;
        }

        setPatients(patientList);
      } catch (err) {
        console.error(err);
        setPatientError('Could not load patients.');
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return patients;

    return patients.filter((patient: any) => {
      const name = patient?.name || patient?.fullName || '';
      const email = patient?.email || '';
      return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
    });
  }, [patients, search]);

  const selectPatient = (patient: any) => {
    const patientId = patient?.id || patient?._id || patient?.patient_id;
    const patientName = patient?.name || patient?.fullName || patient?.email || 'Patient';

    localStorage.setItem('selectedPatientId', patientId);
    localStorage.setItem('selectedPatientName', patientName);

    navigate('/reports');
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Access Patient Records</h1>
        <p className="section-subtitle">Choose a secure method to start a temporary review session.</p>

        <div
          className="grid"
          style={{
            marginTop: 18,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div className="panel" style={{ padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 14,
              }}
            >
              <Shield size={22} />
            </div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Enter OTP</div>
            <input className="input" placeholder="6-digit patient OTP" />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
              Verify OTP
            </button>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 14,
              }}
            >
              <QrCode size={22} />
            </div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Scan QR Code</div>
            <div
              className="panel"
              style={{
                minHeight: 140,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--surface)',
              }}
            >
              <QrCode size={72} color="var(--text-very-light)" />
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 12 }}>
              Point your device at the patient’s QR to open a session.
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 14,
              }}
            >
              <KeyRound size={22} />
            </div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Enter Access Code</div>
            <input className="input" placeholder="Paste secure share token" />
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 14 }}>
              Validate Token
            </button>
          </div>
        </div>

        <section className="card" style={{ padding: 24, marginTop: 20 }}>
          <h2 className="section-title">Patients From Backend</h2>
          <p className="section-subtitle">Click a patient to open their reports.</p>

          <div style={{ marginTop: 14 }}>
            <input
              className="input"
              placeholder="Search patient by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingPatients && (
            <div className="muted" style={{ marginTop: 16 }}>
              Loading patients...
            </div>
          )}

          {patientError && (
            <div style={{ color: 'tomato', marginTop: 16 }}>
              {patientError}
            </div>
          )}

          {!loadingPatients && !patientError && (
            <div className="grid" style={{ marginTop: 16 }}>
              {filteredPatients.length === 0 ? (
                <div className="panel" style={{ padding: 14 }}>
                  No patients found.
                </div>
              ) : (
                filteredPatients.map((patient: any, index) => {
                  const patientId = patient?.id || patient?._id || patient?.patient_id || index;
                  const patientName = patient?.name || patient?.fullName || patient?.email || 'Unnamed Patient';
                  const patientEmail = patient?.email || 'No email available';

                  return (
                    <button
                      key={patientId}
                      className="panel"
                      style={{
                        padding: 14,
                        textAlign: 'left',
                        border: 0,
                        cursor: 'pointer',
                        background: 'var(--card)',
                      }}
                      onClick={() => selectPatient(patient)}
                    >
                      <div style={{ fontWeight: 700 }}>{patientName}</div>
                      <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                        {patientEmail}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>
      </section>

      <aside className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Temporary Access Control</h2>
          <div className="panel" style={{ padding: 16, marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: 'var(--primary-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Patient-controlled sharing</div>
                <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
                  Doctors only see data while the patient’s consent session remains active.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">What To Do</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {[
              '1. Login with email',
              '2. Verify OTP with 000000 for testing',
              '3. Open this page',
              '4. Wait for patient list to load',
              '5. Click a patient to open reports',
            ].map((item) => (
              <div key={item} className="panel" style={{ padding: 14 }}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </aside>

      <style>{`@media (max-width:980px){ .grid[style*='1.2fr .8fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}