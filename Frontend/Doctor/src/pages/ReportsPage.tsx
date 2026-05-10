import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatientRecords } from "../services/recordService";

type RecordItem = {
  id?: string;
  file_name?: string;
  file_url?: string;
  record_type?: string;
  date_issued?: string;
  created_at?: string;
};

const toArray = (payload: any): RecordItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

export default function ReportsPage() {
  const patientId = localStorage.getItem("selectedPatientId") || "";
  const patientName = localStorage.getItem("selectedPatientName") || "Shared Patient";
  const activeShareId = localStorage.getItem("activeShareId") || "";

  const [reports, setReports] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      if (!patientId || !activeShareId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getPatientRecords(patientId);
        setReports(toArray(data));
      } catch (err) {
        console.error(err);
        setError("Could not load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [patientId, activeShareId]);

  if (!patientId || !activeShareId) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Reports</h1>
        <p className="section-subtitle">
          No active patient session found. Reports are available only after the patient shares access.
        </p>

        <Link to="/sessions" className="btn btn-primary" style={{ marginTop: 18 }}>
          Go to Sessions
        </Link>
      </section>
    );
  }

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Reports</h1>
        <p className="section-subtitle">
          {patientName} · Read-only patient documents
        </p>

        {loading && (
          <div className="muted" style={{ marginTop: 20 }}>
            Loading reports...
          </div>
        )}

        {error && (
          <div className="panel" style={{ padding: 14, marginTop: 18, color: "tomato" }}>
            {error}
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            No reports found for this patient.
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="grid" style={{ marginTop: 20 }}>
            {reports.map((report) => (
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
    </div>
  );
}