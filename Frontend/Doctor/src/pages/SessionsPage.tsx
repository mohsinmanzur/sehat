import { FileText, ShieldCheck, TimerReset, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { revokeShare } from "../services/shareService";
import { clearPatientSession, getActiveSession, startPatientSession } from "../utils/session";

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function SessionsPage() {
  const navigate = useNavigate();
  const existing = getActiveSession();

  const [patientOtp, setPatientOtp] = useState("");
  const [measurements, setMeasurements] = useState<any[]>(existing.measurements || []);
  const [reports, setReports] = useState<any[]>(existing.reports || []);
  const [activeShareId, setActiveShareId] = useState(existing.shareId || "");
  const [patientName, setPatientName] = useState(existing.patientName || "Shared Patient");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState(activeShareId ? "Active patient session loaded." : "");
  const [error, setError] = useState("");

  const startSession = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const session = await startPatientSession(patientOtp);

      setActiveShareId(session.shareId);
      setPatientName(session.patientName);
      setMeasurements(session.measurements);
      setReports(session.reports);

      setMessage(
        `Session started for ${session.patientName}. ${session.measurements.length} shared measurement(s) and ${session.reports.length} report(s) found.`
      );
    } catch (err: any) {
      console.error(err);
      setActiveShareId("");
      setPatientName("Shared Patient");
      setMeasurements([]);
      setReports([]);
      setError(err.message || "Could not start session.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this patient session? You will lose access to this patient's shared data."
    );

    if (!confirmed) return;

    const patientId = localStorage.getItem("selectedPatientId") || "";
    const shareId = localStorage.getItem("activeShareId") || activeShareId;

    try {
      setRevoking(true);
      setError("");
      setMessage("");

      if (patientId && shareId) {
        await revokeShare({
          patientId,
          shareId,
        });
      }

      clearPatientSession();

      setMeasurements([]);
      setReports([]);
      setActiveShareId("");
      setPatientOtp("");
      setPatientName("Shared Patient");
      setMessage("Session revoked successfully.");
    } catch (err) {
      console.error(err);

      clearPatientSession();

      setMeasurements([]);
      setReports([]);
      setActiveShareId("");
      setPatientOtp("");
      setPatientName("Shared Patient");
      setMessage("Local session closed. Backend revoke failed, but doctor access was removed from this portal.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Active Sessions</h1>
        <p className="section-subtitle">
          Enter the patient OTP generated from the mobile app to load shared measurements and reports.
        </p>

        <div className="panel" style={{ padding: 16, marginTop: 20 }}>
          <label style={{ fontWeight: 800, display: "block", marginBottom: 8 }}>
            Patient OTP
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
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

        {activeShareId && (
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div>
                <h2 className="section-title" style={{ fontSize: 28 }}>
                  Current Patient Session
                </h2>
                <p className="section-subtitle">
                  {patientName} · {measurements.length} shared measurement(s) · {reports.length} report(s)
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => navigate("/overview")}>
                  View Overview
                </button>

                <button className="btn btn-secondary" onClick={() => navigate("/reports")}>
                  View Reports
                </button>

                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  style={{
                    minHeight: 52,
                    border: "1px solid rgba(239, 68, 68, 0.7)",
                    background: "#ef4444",
                    color: "#ffffff",
                    padding: "14px 18px",
                    borderRadius: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontWeight: 800,
                    cursor: revoking ? "not-allowed" : "pointer",
                    opacity: revoking ? 0.7 : 1,
                  }}
                >
                  <XCircle size={16} />
                  {revoking ? "Revoking..." : "Revoke Access"}
                </button>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="panel" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <strong>Shared Measurements</strong>
                </div>

                {measurements.length === 0 && <div className="muted">No measurements shared.</div>}

                <div className="grid">
                  {measurements.map((item) => (
                    <div key={item.id} className="panel" style={{ padding: 14 }}>
                      <div style={{ fontWeight: 800 }}>
                        {item.measurement_unit?.unit_name || "Measurement"}
                      </div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {formatDate(item.created_at)}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
                        {item.numeric_value ?? "-"} {item.measurement_unit?.symbol || ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <FileText size={18} color="var(--primary)" />
                  <strong>Patient Reports Found</strong>
                </div>

                {reports.length === 0 && <div className="muted">No reports found for this patient.</div>}

                <div className="grid">
                  {reports.map((report) => (
                    <div key={report.id} className="panel" style={{ padding: 14 }}>
                      <div style={{ fontWeight: 800 }}>
                        {report.file_name || "Medical Report"}
                      </div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {report.record_type || "other"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}