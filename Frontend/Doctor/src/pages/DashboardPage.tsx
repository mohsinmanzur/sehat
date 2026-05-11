import {
  Activity,
  Camera,
  ClipboardPlus,
  FileText,
  QrCode,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShareMeasurements } from "../services/shareService";
import { getPatientRecords } from "../services/recordService";

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const actionCardButtonStyle: React.CSSProperties = {
  textAlign: "left",
  border: "none",
  cursor: "pointer",
  color: "var(--text)",
  background: "transparent",
};

const actionCardHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--text)",
  fontWeight: 900,
  fontSize: "1.15rem",
};

const actionCardParagraphStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--text-light)",
  fontSize: "1rem",
  lineHeight: 1.6,
  maxWidth: "30ch",
};

const tryExtractQrValue = (rawText: string) => {
  const raw = rawText.trim();
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    return parsed.share_id || parsed.shareId || parsed.otp || parsed.code || parsed.id || raw;
  } catch {
    return raw;
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [patientsToday, setPatientsToday] = useState(0);
  const [reportsShared, setReportsShared] = useState(0);
  const [measurementsTracked, setMeasurementsTracked] = useState(0);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrMessage, setQrMessage] = useState("");
  const [qrError, setQrError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [manualQrText, setManualQrText] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const loadTodayInsights = async () => {
    const activeShareId = localStorage.getItem("activeShareId") || "";
    const patientId = localStorage.getItem("selectedPatientId") || "";

    try {
      setLoadingInsights(true);

      if (!activeShareId || !patientId) {
        setPatientsToday(0);
        setReportsShared(0);
        setMeasurementsTracked(0);
        return;
      }

      const [sharedRes, reportRes] = await Promise.allSettled([
        getShareMeasurements(activeShareId),
        getPatientRecords(patientId),
      ]);

      const shared = sharedRes.status === "fulfilled" ? toArray(sharedRes.value) : [];
      const reports = reportRes.status === "fulfilled" ? toArray(reportRes.value) : [];

      setPatientsToday(1);
      setReportsShared(reports.length);
      setMeasurementsTracked(shared.length);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadTodayInsights();

    const handler = () => loadTodayInsights();
    window.addEventListener("session-started", handler);

    return () => {
      window.removeEventListener("session-started", handler);
    };
  }, []);

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
    setQrMessage("");
    setQrError("");
    setManualQrText("");
  };

  const startSessionFromQrValue = async (rawValue: string) => {
    const shareId = tryExtractQrValue(rawValue);

    if (!shareId) {
      setQrError("QR code is empty or invalid.");
      return;
    }

    try {
      setQrError("");
      setQrMessage("QR detected. Starting session...");

      const data = await getShareMeasurements(shareId);
      const shared = toArray(data);

      if (shared.length === 0) {
        setQrError("No shared data found for this QR.");
        return;
      }

      const patientId = shared[0]?.patient_id || shared[0]?.patient?.id || "";
      const patientName = shared[0]?.patient?.name || "Shared Patient";

      if (!patientId) {
        setQrError("Shared data found, but patient ID is missing.");
        return;
      }

      localStorage.setItem("activeShareId", shareId);
      localStorage.setItem("selectedPatientId", patientId);
      localStorage.setItem("selectedPatientName", patientName);

      window.dispatchEvent(new CustomEvent("session-started"));

      closeQrModal();
      navigate("/overview");
    } catch (err) {
      console.error(err);
      setQrError("Could not start session from this QR.");
    }
  };

  const openQrCamera = async () => {
    setQrError("");
    setQrMessage("");
    setCameraSupported(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setQrError("Camera access is not supported on this browser/device.");
      return;
    }

    if (!window.BarcodeDetector) {
      setCameraSupported(false);
      setQrError("QR scanning is not supported in this browser. Use manual QR entry below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setQrMessage("Point the camera at the patient QR code.");

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      scanIntervalRef.current = window.setInterval(async () => {
        try {
          if (!videoRef.current) return;

          const barcodes = await detector.detect(videoRef.current);
          const rawValue = barcodes?.[0]?.rawValue || "";

          if (rawValue) {
            await startSessionFromQrValue(rawValue);
          }
        } catch (err) {
          console.error(err);
        }
      }, 900);
    } catch (err) {
      console.error(err);
      setQrError("Could not open camera. Allow camera permission and try again.");
    }
  };

  useEffect(() => {
    if (!qrModalOpen) {
      stopCamera();
      return;
    }

    openQrCamera();

    return () => stopCamera();
  }, [qrModalOpen]);

  const qrSupportText = useMemo(() => {
    if (!cameraSupported) return "Camera scanning unavailable. Use manual QR entry.";
    return cameraReady ? "Camera is active." : "Preparing camera...";
  }, [cameraSupported, cameraReady]);

  return (
    <>
      <div className="dashboard-clean">
        <section className="dashboard-actions-grid">
          <button
            type="button"
            className="dashboard-action-card card"
            onClick={() => window.dispatchEvent(new CustomEvent("open-patient-otp-modal"))}
            style={actionCardButtonStyle}
          >
            <div className="dashboard-action-icon">
              <ClipboardPlus size={24} />
            </div>

            <h2 style={actionCardHeadingStyle}>Enter Patient OTP</h2>

            <p style={actionCardParagraphStyle}>
              Start a read-only patient session using the OTP shared by the patient.
            </p>
          </button>

          <button
            type="button"
            className="dashboard-action-card card"
            onClick={() => setQrModalOpen(true)}
            style={actionCardButtonStyle}
          >
            <div className="dashboard-action-icon">
              <QrCode size={24} />
            </div>

            <h2 style={actionCardHeadingStyle}>Scan QR</h2>

            <p style={actionCardParagraphStyle}>
              Open your camera on mobile and scan the patient QR for quick access.
            </p>
          </button>
        </section>

        <section className="card dashboard-insights-card">
          <div className="dashboard-section-head">
            <div>
              <h2 className="section-title">Today&apos;s Insights</h2>
              <p className="section-subtitle">
                Based on the active patient session for today.
              </p>
            </div>
          </div>

          <div className="dashboard-insights-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="dashboard-stat-panel dashboard-stat-panel-primary">
              <div className="dashboard-stat-icon">
                <Users size={18} />
              </div>
              <div className="dashboard-stat-label">Patients encountered today</div>
              <div className="dashboard-stat-value">{loadingInsights ? "..." : patientsToday}</div>
            </div>

            <div className="dashboard-stat-panel">
              <div className="dashboard-stat-icon">
                <FileText size={18} />
              </div>
              <div className="dashboard-stat-label">Reports shared</div>
              <div className="dashboard-stat-value">{loadingInsights ? "..." : reportsShared}</div>
            </div>

            <div className="dashboard-stat-panel">
              <div className="dashboard-stat-icon">
                <Activity size={18} />
              </div>
              <div className="dashboard-stat-label">Measurements tracked</div>
              <div className="dashboard-stat-value">{loadingInsights ? "..." : measurementsTracked}</div>
            </div>
          </div>
        </section>
      </div>

      {qrModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.72)",
            display: "grid",
            placeItems: "center",
            zIndex: 300,
            padding: 16,
          }}
          onClick={closeQrModal}
        >
          <div
            className="card"
            style={{ width: "min(100%, 720px)", padding: 24, borderRadius: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h2 className="section-title" style={{ fontSize: 34 }}>
                  Scan Patient QR
                </h2>
                <p className="section-subtitle">
                  Scan the patient QR to start a read-only shared session.
                </p>
              </div>

              <button className="btn btn-secondary" onClick={closeQrModal} style={{ width: 46, height: 46, padding: 0, borderRadius: 16 }}>
                <X size={18} />
              </button>
            </div>

            <div className="panel" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <Camera size={18} color="var(--primary)" />
              <div className="muted">{qrSupportText}</div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 24, overflow: "hidden", background: "#000" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  minHeight: 280,
                  maxHeight: 460,
                  objectFit: "cover",
                  borderRadius: 18,
                  display: "block",
                  background: "#000",
                }}
              />
            </div>

            {qrMessage && (
              <div className="panel" style={{ padding: 14, marginTop: 16 }}>
                {qrMessage}
              </div>
            )}

            {qrError && (
              <div className="panel" style={{ padding: 14, marginTop: 16, color: "tomato" }}>
                {qrError}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                Manual QR / OTP fallback
              </label>

              <textarea
                className="input"
                placeholder="Paste QR content or patient OTP here"
                value={manualQrText}
                onChange={(e) => setManualQrText(e.target.value)}
                style={{ minHeight: 110, resize: "vertical" }}
              />

              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => startSessionFromQrValue(manualQrText)}>
                  Start Session
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