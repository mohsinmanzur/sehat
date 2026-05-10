import { Activity, AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getShareMeasurements, SharedMeasurement } from "../services/shareService";
import { getDocumentUrlByMeasurementId, getPatientRecords } from "../services/recordService";

type RecordItem = {
  id?: string;
  file_name?: string;
  record_type?: string;
  date_issued?: string;
  created_at?: string;
};

const toArray = (payload: any) => {
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

export default function OverviewPage() {
  const patientId = localStorage.getItem("selectedPatientId") || "";
  const patientName = localStorage.getItem("selectedPatientName") || "Shared Patient";
  const activeShareId = localStorage.getItem("activeShareId") || "";

  const [measurements, setMeasurements] = useState<SharedMeasurement[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [docLoadingId, setDocLoadingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!activeShareId || !patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [sharedRes, recordsRes] = await Promise.allSettled([
          getShareMeasurements(activeShareId),
          getPatientRecords(patientId),
        ]);

        if (sharedRes.status === "fulfilled") {
          setMeasurements(toArray(sharedRes.value));
        } else {
          setError("Could not load shared measurements.");
        }

        if (recordsRes.status === "fulfilled") {
          setRecords(toArray(recordsRes.value));
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeShareId, patientId]);

  const abnormalCount = useMemo(() => {
    return measurements.filter((item) => {
      const value = Number(item.numeric_value);
      return !Number.isNaN(value) && value <= 0;
    }).length;
  }, [measurements]);

  const openDocument = async (measurementId?: string) => {
    if (!measurementId) return;

    try {
      setDocLoadingId(measurementId);
      const data = await getDocumentUrlByMeasurementId(measurementId);

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        alert("No source document found for this measurement.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not open source document.");
    } finally {
      setDocLoadingId("");
    }
  };

  if (!activeShareId || !patientId) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Patient Overview</h1>
        <p className="section-subtitle">
          No active patient session found. Start a session first.
        </p>

        <Link to="/sessions" className="btn btn-primary" style={{ marginTop: 18 }}>
          Go to Sessions
        </Link>
      </section>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">{patientName}</h1>
        <p className="section-subtitle">Shared patient health overview</p>

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 20 }}
        >
          <div className="dashboard-stat-panel dashboard-stat-panel-primary">
            <div className="dashboard-stat-icon">
              <Activity size={18} />
            </div>
            <div className="dashboard-stat-label">Shared Measurements</div>
            <div className="dashboard-stat-value">
              {loading ? "..." : measurements.length}
            </div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon">
              <FileText size={18} />
            </div>
            <div className="dashboard-stat-label">Patient Reports</div>
            <div className="dashboard-stat-value">{loading ? "..." : records.length}</div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon warning">
              <AlertTriangle size={18} />
            </div>
            <div className="dashboard-stat-label">Needs Review</div>
            <div className="dashboard-stat-value">{loading ? "..." : abnormalCount}</div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h2 className="section-title">Shared Results</h2>
        <p className="section-subtitle">
          These are the measurements shared by the patient.
        </p>

        {error && (
          <div className="panel" style={{ padding: 14, color: "tomato", marginTop: 18 }}>
            {error}
          </div>
        )}

        {loading && <div className="muted" style={{ marginTop: 18 }}>Loading...</div>}

        {!loading && measurements.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            No shared measurements found.
          </div>
        )}

        {!loading && measurements.length > 0 && (
          <div className="grid" style={{ marginTop: 18 }}>
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
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {item.measurement_unit?.unit_name || "Measurement"}
                  </div>

                  <div className="muted" style={{ marginTop: 4 }}>
                    {formatDate(item.created_at)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {item.numeric_value ?? "-"} {item.measurement_unit?.symbol || ""}
                  </div>

                  {item.document_id && (
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: 10 }}
                      onClick={() => openDocument(item.id)}
                      disabled={docLoadingId === item.id}
                    >
                      <ExternalLink size={15} />
                      {docLoadingId === item.id ? "Opening..." : "Source Document"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="section-title">Patient Reports</h2>
            <p className="section-subtitle">
              Reports are shown only after an active shared session is loaded.
            </p>
          </div>

          <Link to="/reports" className="btn btn-primary">
            View Reports
          </Link>
        </div>

        {!loading && records.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            No reports found for this patient.
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="grid" style={{ marginTop: 18 }}>
            {records.slice(0, 3).map((record) => (
              <Link
                key={record.id}
                to={`/reports/${record.id}`}
                className="panel"
                style={{
                  padding: 16,
                  display: "block",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {record.file_name || "Medical Report"}
                </div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {record.record_type || "other"} ·{" "}
                  {formatDate(record.date_issued || record.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 900px) {
          .grid[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}