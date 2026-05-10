import { ShieldCheck, TimerReset, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShareMeasurements, revokeShare, SharedMeasurement } from "../services/shareService";

const toArray = (payload: any): SharedMeasurement[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function SessionsPage() {
  const navigate = useNavigate();

  const [patientOtp, setPatientOtp] = useState("");
  const [measurements, setMeasurements] = useState<SharedMeasurement[]>([]);
  const [activeShareId, setActiveShareId] = useState(localStorage.getItem("activeShareId") || "");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const startSession = async () => {
    const cleanOtp = patientOtp.trim();

    if (!cleanOtp) {
      setError("Please enter the patient OTP first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await getShareMeasurements(cleanOtp);
      const list = toArray(data);

      if (list.length === 0) {
        setMeasurements([]);
        setError("No shared data found for this OTP.");
        return;
      }

      const patientId = list[0]?.patient_id || list[0]?.patient?.id || "";
      const patientName = list[0]?.patient?.name || "Shared Patient";

      if (!patientId) {
        setError("Shared data was found, but patient ID is missing.");
        return;
      }

      localStorage.setItem("activeShareId", cleanOtp);
      localStorage.setItem("selectedPatientId", patientId);
      localStorage.setItem("selectedPatientName", patientName);

      setActiveShareId(cleanOtp);
      setMeasurements(list);
      setMessage("Session started successfully. You can now view shared results and reports.");
    } catch (err) {
      console.error(err);
      setMeasurements([]);
      setError("Invalid OTP or session could not be started.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    const patientId =
      measurements[0]?.patient_id ||
      measurements[0]?.patient?.id ||
      localStorage.getItem("selectedPatientId") ||
      "";

    if (!patientId || !activeShareId) {
      setError("Patient ID or active session ID is missing.");
      return;
    }

    try {
      setRevoking(true);
      setError("");
      setMessage("");

      await revokeShare({
        patientId,
        shareId: activeShareId,
      });

      localStorage.removeItem("activeShareId");
      localStorage.removeItem("selectedPatientId");
      localStorage.removeItem("selectedPatientName");

      setMeasurements([]);
      setActiveShareId("");
      setPatientOtp("");
      setMessage("Session revoked successfully.");
    } catch (err) {
      console.error(err);
      setError("Could not revoke this session.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Active Sessions</h1>
        <p className="section-subtitle">
          Enter the patient OTP to start a read-only shared session.
        </p>

        <div className="panel" style={{ padding: 16, marginTop: 20 }}>
          <label style={{ fontWeight: 800, display: "block", marginBottom: 8 }}>
            Patient OTP
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
            }}
          >
            <input
              className="input"
              placeholder="Enter patient OTP"
              value={patientOtp}
              onChange={(e) => setPatientOtp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startSession();
              }}
            />

            <button className="btn btn-primary" onClick={startSession} disabled={loading}>
              <TimerReset size={16} />
              {loading ? "Starting..." : "Start Session"}
            </button>
          </div>
        </div>

        {message && (
          <div className="panel" style={{ padding: 14, marginTop: 18 }}>
            {message}
          </div>
        )}

        {error && (
          <div className="panel" style={{ padding: 14, marginTop: 18, color: "tomato" }}>
            {error}
          </div>
        )}

        {measurements.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div>
                <h2 className="section-title" style={{ fontSize: 28 }}>
                  Current Active Session
                </h2>
                <p className="section-subtitle">
                  {measurements[0]?.patient?.name || "Patient"} · {measurements.length} shared result(s)
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => navigate("/overview")}>
                  View Overview
                </button>

                <button className="btn btn-secondary" onClick={() => navigate("/reports")}>
                  View Reports
                </button>

                <button className="btn btn-secondary" onClick={handleRevoke} disabled={revoking}>
                  <XCircle size={16} />
                  {revoking ? "Revoking..." : "Revoke Access"}
                </button>
              </div>
            </div>

            <div className="grid">
              {measurements.map((item) => (
                <div
                  key={item.id}
                  className="panel"
                  style={{
                    padding: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        background: "var(--primary-soft)",
                        color: "var(--primary)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>

                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {item.measurement_unit?.unit_name || "Measurement"}
                      </div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 26, fontWeight: 900 }}>
                      {item.numeric_value ?? "-"}
                    </div>
                    <div className="muted">{item.measurement_unit?.symbol || ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 700px) {
          div[style*="1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}