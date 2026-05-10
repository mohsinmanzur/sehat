import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecordById, getSecureRecordUrl } from "../services/recordService";

type RecordItem = {
  id?: string;
  patient_id?: string;
  file_name?: string;
  file_url?: string;
  record_type?: string;
  ocr_extracted_text?: string | null;
  date_issued?: string;
  created_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();

  const activeShareId = localStorage.getItem("activeShareId") || "";
  const selectedPatientId = localStorage.getItem("selectedPatientId") || "";

  const [report, setReport] = useState<RecordItem | null>(null);
  const [secureLoading, setSecureLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id || !activeShareId || !selectedPatientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getRecordById(id);
        const item = Array.isArray(data) ? data[0] : data;

        if (item?.patient_id && item.patient_id !== selectedPatientId) {
          setError("This report does not belong to the active patient session.");
          setReport(null);
          return;
        }

        setReport(item || null);
      } catch (err) {
        console.error(err);
        setError("Could not load report.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, activeShareId, selectedPatientId]);

  const openSecureFile = async () => {
    if (!report?.file_url) {
      alert("No file URL available.");
      return;
    }

    try {
      setSecureLoading(true);

      const data = await getSecureRecordUrl(report.file_url);
      const url = data?.url || report.file_url;

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      window.open(report.file_url, "_blank", "noopener,noreferrer");
    } finally {
      setSecureLoading(false);
    }
  };

  if (!activeShareId || !selectedPatientId) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Report Detail</h1>
        <p className="section-subtitle">
          No active patient session found. Start a session before viewing reports.
        </p>

        <Link to="/sessions" className="btn btn-primary" style={{ marginTop: 18 }}>
          Go to Sessions
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Report Detail</h1>
        <p className="section-subtitle">Loading report...</p>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Report Detail</h1>
        <div className="panel" style={{ padding: 14, color: "tomato", marginTop: 18 }}>
          {error || "Report not found."}
        </div>
      </section>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
      <section className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h1 className="section-title">{report.file_name || "Medical Report"}</h1>
            <p className="section-subtitle">
              {report.record_type || "other"} ·{" "}
              {formatDate(report.date_issued || report.created_at)}
            </p>
          </div>

          <button className="btn btn-primary" onClick={openSecureFile} disabled={secureLoading}>
            <Download size={16} />
            {secureLoading ? "Opening..." : "Open File"}
          </button>
        </div>

        <div className="panel" style={{ minHeight: 420, padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              color: "var(--text-light)",
            }}
          >
            <FileText size={18} />
            OCR Extracted Text
          </div>

          {report.ocr_extracted_text ? (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {report.ocr_extracted_text}
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed var(--border)",
                borderRadius: 18,
                minHeight: 300,
                display: "grid",
                placeItems: "center",
                color: "var(--text-very-light)",
              }}
            >
              No OCR text stored for this report.
            </div>
          )}
        </div>
      </section>

      <aside className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Report Info</h2>

          <div className="grid" style={{ marginTop: 16 }}>
            <div className="panel" style={{ padding: 14 }}>
              <div className="muted">Report ID</div>
              <strong style={{ wordBreak: "break-word" }}>{report.id}</strong>
            </div>

            <div className="panel" style={{ padding: 14 }}>
              <div className="muted">Patient ID</div>
              <strong style={{ wordBreak: "break-word" }}>{report.patient_id}</strong>
            </div>

            <div className="panel" style={{ padding: 14 }}>
              <div className="muted">Access Mode</div>
              <strong>Read-only shared session</strong>
            </div>
          </div>
        </section>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .grid[style*="1.2fr .8fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}