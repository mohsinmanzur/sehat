import { Activity, AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDocumentUrlByMeasurementId,
  openRecordFile,
} from "../services/recordService";
import { getActiveSession } from "../utils/session";

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

export default function OverviewPage() {
  const session = getActiveSession();

  const [docLoadingId, setDocLoadingId] = useState("");

  const measurements = session.measurements || [];
  const records = session.reports || [];

  const abnormalCount = useMemo(() => {
    return measurements.filter((item: any) => {
      const value = Number(item.numeric_value);
      return !Number.isNaN(value) && value <= 0;
    }).length;
  }, [measurements]);

  const getMeasurementDocument = (item: any) => {
    return (
      item?.medical_document ||
      item?.document ||
      item?.record ||
      item?.report ||
      null
    );
  };

  const hasDocument = (item: any) => {
    const doc = getMeasurementDocument(item);

    return Boolean(
      doc?.file_url ||
        doc?.url ||
        doc?.document_url ||
        item?.file_url ||
        item?.document_url ||
        item?.document_id ||
        doc?.id
    );
  };

  const openDocument = async (item: any) => {
    try {
      setDocLoadingId(item.id);

      const doc = getMeasurementDocument(item);

      console.log("Opening measurement document:", {
        measurement: item,
        document: doc,
      });

      if (doc?.file_url || doc?.url || doc?.document_url || item?.file_url || item?.document_url) {
        await openRecordFile(
          doc?.file_url ||
            doc?.url ||
            doc?.document_url ||
            item?.file_url ||
            item?.document_url
        );
        return;
      }

      const measurementId = item?.id;

      if (measurementId) {
        const data = await getDocumentUrlByMeasurementId(measurementId);

        console.log("Document URL response:", data);

        const url =
          data?.url ||
          data?.file_url ||
          data?.document_url ||
          data?.secure_url ||
          data?.data?.url ||
          data?.data?.file_url ||
          data?.data?.document_url;

        if (url) {
          await openRecordFile(url);
          return;
        }
      }

      alert("Document exists, but no openable file URL was returned by backend.");
    } catch (err) {
      console.error(err);
      alert("Could not open source document.");
    } finally {
      setDocLoadingId("");
    }
  };

  if (!session.shareId || !session.patientId) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">No overview available</h1>
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
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">{session.patientName}</h1>
        <p className="section-subtitle">Shared patient health overview</p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 20 }}>
          <div className="dashboard-stat-panel dashboard-stat-panel-primary">
            <div className="dashboard-stat-icon">
              <Activity size={18} />
            </div>
            <div className="dashboard-stat-label">Shared Measurements</div>
            <div className="dashboard-stat-value">{measurements.length}</div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon">
              <FileText size={18} />
            </div>
            <div className="dashboard-stat-label">Patient Reports</div>
            <div className="dashboard-stat-value">{records.length}</div>
          </div>

          <div className="dashboard-stat-panel">
            <div className="dashboard-stat-icon warning">
              <AlertTriangle size={18} />
            </div>
            <div className="dashboard-stat-label">Needs Review</div>
            <div className="dashboard-stat-value">{abnormalCount}</div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h2 className="section-title">Shared Results</h2>
        <p className="section-subtitle">
          These measurements are visible because the patient started a session.
        </p>

        {measurements.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            No shared measurements found.
          </div>
        )}

        {measurements.length > 0 && (
          <div className="grid" style={{ marginTop: 18 }}>
            {measurements.map((item: any) => (
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
                    {item.measurement_unit?.unit_name ||
                      item.unit?.unit_name ||
                      item.name ||
                      "Measurement"}
                  </div>

                  <div className="muted" style={{ marginTop: 4 }}>
                    {formatDate(item.created_at || item.createdAt)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {item.numeric_value ?? item.value ?? "-"}{" "}
                    {item.measurement_unit?.symbol || item.unit?.symbol || ""}
                  </div>

                  {hasDocument(item) && (
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: 10 }}
                      onClick={() => openDocument(item)}
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
              Reports are visible during the active patient session.
            </p>
          </div>

          <Link to="/reports" className="btn btn-primary">
            View Reports
          </Link>
        </div>

        {records.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 18 }}>
            No reports found for this patient.
          </div>
        )}

        {records.length > 0 && (
          <div className="grid" style={{ marginTop: 18 }}>
            {records.slice(0, 3).map((record: any) => (
              <Link
                key={record.id}
                to={`/reports/${record.id}`}
                className="panel"
                style={{ padding: 16, display: "block" }}
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