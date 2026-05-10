import {
  ClipboardPlus,
  QrCode,
  Users,
  FileText,
  Activity,
  X,
  Camera,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getPatientById, getPatientByEmail } from '../services/patientService';
import { getPatientRecords } from '../services/recordService';
import { getHealthMeasurements } from '../services/measurementService';

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

type PatientLike = {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.72)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 200,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  width: 'min(100%, 560px)',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 28,
  boxShadow: 'var(--shadow-lg)',
  padding: 24,
  backdropFilter: 'blur(14px)',
};

const actionCardButtonStyle: React.CSSProperties = {
  textAlign: 'left',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text)',
  background: 'transparent',
};

const actionCardHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--text)',
  fontWeight: 800,
  fontSize: '1.15rem',
};

const actionCardParagraphStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--text-light)',
  fontSize: '1rem',
  lineHeight: 1.6,
  maxWidth: '28ch',
};

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.patients)) return payload.patients;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.measurements)) return payload.measurements;
  return [];
};

const getPatientDisplayName = (patient: PatientLike | null | undefined) => {
  return patient?.name || patient?.fullName || 'Selected Patient';
};

const tryExtractPatientPayload = (rawText: string) => {
  const raw = rawText.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    return {
      patientId:
        parsed.patient_id ||
        parsed.patientId ||
        parsed.id ||
        '',
      patientName:
        parsed.patient_name ||
        parsed.patientName ||
        parsed.name ||
        '',
      patientEmail: parsed.email || '',
    };
  } catch {
    // not json
  }

  const patientIdMatch = raw.match(/patient[_-\s]?id[:=]\s*([a-zA-Z0-9-]+)/i);
  const emailMatch = raw.match(/email[:=]\s*([^\s,;]+)/i);

  if (patientIdMatch || emailMatch) {
    return {
      patientId: patientIdMatch?.[1] || '',
      patientName: '',
      patientEmail: emailMatch?.[1] || '',
    };
  }

  return {
    patientId: raw,
    patientName: '',
    patientEmail: '',
  };
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [patientCount, setPatientCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [measurementCount, setMeasurementCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);

  const [qrMessage, setQrMessage] = useState('');
  const [qrError, setQrError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [manualQrText, setManualQrText] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

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

        const patients = toArray(patientsRes);
        const reports = toArray(reportsRes);
        const measurements = toArray(measurementsRes);

        setPatientCount(patients.length);
        setReportCount(reports.length);
        setMeasurementCount(measurements.length);
      } catch (err) {
        console.error(err);
        setError('Could not load dashboard insights.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  useEffect(() => {
    const openModalListener = () => {
      setOtpModalOpen(true);
    };

    window.addEventListener('open-patient-otp-modal', openModalListener);

    return () => {
      window.removeEventListener('open-patient-otp-modal', openModalListener);
    };
  }, []);

  const closeOtpModal = () => {
    setOtpModalOpen(false);
    setEnteredOtp('');
    setOtpInfo('');
    setOtpBusy(false);
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraReady(false);
  };

  const closeQrModal = () => {
    stopCamera();
    setQrModalOpen(false);
    setQrMessage('');
    setQrError('');
    setManualQrText('');
  };

  const handleOtpSubmit = async () => {
    try {
      setOtpBusy(true);
      setOtpInfo('');
      setQrError('');

      const cleanOtp = enteredOtp.trim();

      if (!cleanOtp) {
        setOtpInfo('Please enter the patient OTP first.');
        return;
      }

      localStorage.setItem('pendingPatientOtp', cleanOtp);

      setOtpInfo(
        'OTP captured in the popup. Backend validation for patient OTP access is not available yet, so this step is currently UI-ready only.'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const openQrCamera = async () => {
    setQrError('');
    setQrMessage('');
    setCameraSupported(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setQrError('Camera access is not supported on this browser/device.');
      return;
    }

    if (!window.BarcodeDetector) {
      setCameraSupported(false);
      setQrError(
        'QR scanning is not supported in this browser. Use a supported mobile browser or paste the QR content manually below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setQrMessage('Point the camera at the patient QR code.');

      const detector = new window.BarcodeDetector({
        formats: ['qr_code'],
      });

      scanIntervalRef.current = window.setInterval(async () => {
        try {
          if (!videoRef.current) return;
          const barcodes = await detector.detect(videoRef.current);

          if (!barcodes || !barcodes.length) return;

          const rawValue = barcodes[0]?.rawValue || '';
          if (!rawValue) return;

          await handleQrPayload(rawValue);
        } catch (scanErr) {
          console.error('QR scan error:', scanErr);
        }
      }, 900);
    } catch (err) {
      console.error(err);
      setQrError('Could not open camera. Please allow camera permission and try again.');
    }
  };

  const handleQrPayload = async (rawValue: string) => {
    try {
      setQrError('');
      setQrMessage('QR code detected. Opening patient...');

      const extracted = tryExtractPatientPayload(rawValue);

      if (!extracted) {
        setQrError('Could not understand the QR content.');
        return;
      }

      let patient: PatientLike | null = null;

      if (extracted.patientId) {
        try {
          const result = await getPatientById(extracted.patientId);
          patient = Array.isArray(result) ? result[0] : result;
        } catch (err) {
          console.error('Patient by id lookup failed:', err);
        }
      }

      if (!patient && extracted.patientEmail) {
        try {
          const result = await getPatientByEmail(extracted.patientEmail);
          patient = Array.isArray(result) ? result[0] : result;
        } catch (err) {
          console.error('Patient by email lookup failed:', err);
        }
      }

      if (!patient && extracted.patientId) {
        patient = {
          id: extracted.patientId,
          name: extracted.patientName || 'Selected Patient',
          email: extracted.patientEmail || '',
        };
      }

      if (!patient) {
        setQrError('No matching patient was found from this QR code.');
        return;
      }

      localStorage.setItem('selectedPatientId', patient.id || patient._id || extracted.patientId || '');
      localStorage.setItem(
        'selectedPatientName',
        getPatientDisplayName(patient) || extracted.patientName || 'Selected Patient'
      );

      stopCamera();
      setQrModalOpen(false);
      navigate('/overview');
    } catch (err) {
      console.error(err);
      setQrError('QR was detected, but opening the patient failed.');
    }
  };

  useEffect(() => {
    if (!qrModalOpen) {
      stopCamera();
      return;
    }

    openQrCamera();

    return () => {
      stopCamera();
    };
  }, [qrModalOpen]);

  const qrSupportText = useMemo(() => {
    if (!cameraSupported) {
      return 'Use manual QR content entry below if camera scanning is unavailable.';
    }
    return cameraReady ? 'Camera is active.' : 'Preparing camera...';
  }, [cameraSupported, cameraReady]);

  return (
    <>
      <div className="dashboard-clean">
        <section className="dashboard-actions-grid">
          <button
            type="button"
            className="dashboard-action-card card"
            onClick={() => setOtpModalOpen(true)}
            style={actionCardButtonStyle}
          >
            <div className="dashboard-action-icon">
              <ClipboardPlus size={24} />
            </div>
            <h2 style={actionCardHeadingStyle}>Enter Patient OTP</h2>
            <p style={actionCardParagraphStyle}>
              Start a secure temporary access session using the patient OTP.
            </p>
          </button>

          <button
            type="button"
            className="dashboard-action-card card"
            onClick={() => window.dispatchEvent(new CustomEvent("open-patient-otp-modal"))}
            style={actionCardButtonStyle}
          >
            <div className="dashboard-action-icon">
              <QrCode size={24} />
            </div>
            <h2 style={actionCardHeadingStyle}>Scan QR</h2>
            <p style={actionCardParagraphStyle}>
              Use the patient QR for quick access without extra steps.
            </p>
          </button>
        </section>

        <section className="card dashboard-insights-card">
          <div className="dashboard-section-head">
            <div>
              <h2 className="section-title">Patient Insights</h2>
              <p className="section-subtitle">Quick context for today.</p>
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

      {otpModalOpen && (
        <div style={overlayStyle} onClick={closeOtpModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <h2 className="section-title" style={{ fontSize: 38 }}>
                  Enter Patient OTP
                </h2>
                <p className="section-subtitle">
                  Ask the patient for the access OTP and enter it here.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={closeOtpModal}
                style={{ width: 46, height: 46, padding: 0, borderRadius: 16 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="panel" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ShieldAlert size={18} color="var(--primary)" />
                <div style={{ fontWeight: 700 }}>Temporary secure access</div>
              </div>

              <div className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>
                This popup is now ready for OTP input. Real OTP verification still needs a backend
                endpoint for doctor-patient access session validation.
              </div>
            </div>

            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Patient OTP
            </label>

            <input
              className="input"
              placeholder="Enter OTP shared by the patient"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />

            {otpInfo && (
              <div
                className="panel"
                style={{
                  padding: 14,
                  marginTop: 16,
                  color: otpInfo.toLowerCase().includes('not available')
                    ? '#fbbf24'
                    : 'var(--text)',
                }}
              >
                {otpInfo}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleOtpSubmit} disabled={otpBusy}>
                {otpBusy ? 'Submitting...' : 'Submit OTP'}
              </button>

              <button className="btn btn-secondary" onClick={closeOtpModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {qrModalOpen && (
        <div style={overlayStyle} onClick={closeQrModal}>
          <div
            style={{
              ...modalStyle,
              width: 'min(100%, 720px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <h2 className="section-title" style={{ fontSize: 38 }}>
                  Scan Patient QR
                </h2>
                <p className="section-subtitle">
                  Use your phone camera to scan the patient QR for quick access.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={closeQrModal}
                style={{ width: 46, height: 46, padding: 0, borderRadius: 16 }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="panel"
              style={{
                padding: 16,
                marginBottom: 16,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <Camera size={18} color="var(--primary)" />
              <div className="muted">{qrSupportText}</div>
            </div>

            <div
              className="panel"
              style={{
                padding: 12,
                borderRadius: 24,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  minHeight: 280,
                  maxHeight: 460,
                  objectFit: 'cover',
                  borderRadius: 18,
                  display: 'block',
                  background: '#000',
                }}
              />
            </div>

            {qrMessage && (
              <div className="panel" style={{ padding: 14, marginTop: 16 }}>
                {qrMessage}
              </div>
            )}

            {qrError && (
              <div className="panel" style={{ padding: 14, marginTop: 16, color: 'tomato' }}>
                {qrError}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Manual QR content fallback
              </label>

              <textarea
                className="input"
                placeholder='Paste QR content here if camera scan is unavailable. Example: {"patient_id":"abc-123","patient_name":"Mohsin Manzoor"}'
                value={manualQrText}
                onChange={(e) => setManualQrText(e.target.value)}
                style={{ minHeight: 110, resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleQrPayload(manualQrText)}
                >
                  Open Patient From QR
                </button>

                <button className="btn btn-secondary" onClick={closeQrModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}