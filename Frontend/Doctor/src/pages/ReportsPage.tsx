import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { getActiveSession } from "../utils/session";

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

export default function ReportsPage() {
  const session = getActiveSession();

  if (!session.shareId || !session.patientId) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">No reports available</h1>
        <p className="section-subtitle">No patient session started.</p>

        <button
          className="btn btn-primary"
          style={{ marginTop: 18 }}
          onClick={() => window.dispatchEvent(new CustomEvent("open-patient-otp-modal"))}
        >
          Enter Patient OTP
        </button>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 className="section-title">Reports</h1>
      <p className="section-subtitle">
        {session.patientName} · Reports available during active session
      </p>

      {session.reports.length === 0 && (
        <div className="panel" style={{ padding: 16, marginTop: 18 }}>
          No reports found for this patient.
        </div>
      )}

      {session.reports.length > 0 && (
        <div className="grid" style={{ marginTop: 20 }}>
          {session.reports.map((report: any) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="panel"
              style={{
                padding: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <FileText size={20} />
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>
                    {report.file_name || "Medical Report"}
                  </div>
                  <div className="muted">
                    {report.record_type || "other"} ·{" "}
                    {formatDate(report.date_issued || report.created_at)}
                  </div>
                </div>
              </div>

              <span className="badge primary">Open</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}