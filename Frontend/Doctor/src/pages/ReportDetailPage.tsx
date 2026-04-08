import { Download, FileText, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecordById } from '../services/recordService';

type RecordItem = {
  id?: string;
  patient_id?: string;
  file_name?: string;
  file_url?: string;
  record_type?: string;
  ocr_extracted_text?: string;
  date_issued?: string;
  created_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [detail, setDetail] = useState<RecordItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getRecordById(id);
        setDetail(data || null);
      } catch (err) {
        console.error(err);
        setError('Could not load report details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
        <section className="card" style={{ padding: 24, minHeight: 400 }} />
        <aside className="grid">
          <section className="card" style={{ padding: 24, minHeight: 180 }} />
          <section className="card" style={{ padding: 24, minHeight: 180 }} />
        </aside>
        <style>{`@media (max-width:980px){ .grid[style*='1.2fr .8fr']{grid-template-columns:1fr!important;} }`}</style>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h1 className="section-title">Report Detail</h1>
          <div className="panel" style={{ padding: 16, marginTop: 18, color: 'tomato' }}>
            {error || 'Report not found.'}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
      <section className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 14,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 className="section-title">{detail.file_name || 'Medical Report'}</h1>
            <p className="section-subtitle">
              {(detail.record_type || 'other').replaceAll('_', ' ')} · {formatDate(detail.date_issued || detail.created_at)}
            </p>
          </div>

          {detail.file_url ? (
            <a
              className="btn btn-secondary"
              href={detail.file_url}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={16} /> Open File
            </a>
          ) : (
            <button className="btn btn-secondary" disabled>
              <Download size={16} /> No File URL
            </button>
          )}
        </div>

        <div className="panel" style={{ minHeight: 420, padding: 26, background: 'var(--surface)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              color: 'var(--text-light)',
            }}
          >
            <FileText size={18} /> Report Preview / OCR Text
          </div>

          {detail.ocr_extracted_text ? (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                color: 'var(--text)',
              }}
            >
              {detail.ocr_extracted_text}
            </div>
          ) : (
            <div
              style={{
                border: '1px dashed var(--border)',
                borderRadius: 18,
                minHeight: 320,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-very-light)',
              }}
            >
              No OCR text stored for this report.
            </div>
          )}
        </div>
      </section>

      <aside className="grid">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="section-title">Report Information</h2>

          <div className="grid" style={{ marginTop: 14 }}>
            <div className="panel" style={{ padding: 14 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Report ID</div>
              <div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{detail.id || '-'}</div>
            </div>

            <div className="panel" style={{ padding: 14 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Patient ID</div>
              <div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{detail.patient_id || '-'}</div>
            </div>

            <div className="panel" style={{ padding: 14 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Type</div>
              <div style={{ fontWeight: 700 }}>{(detail.record_type || 'other').replaceAll('_', ' ')}</div>
            </div>

            <div className="panel" style={{ padding: 14 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Issued On</div>
              <div style={{ fontWeight: 700 }}>{formatDate(detail.date_issued)}</div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <StickyNote size={17} color="var(--primary)" />
            <strong>Stored Notes</strong>
          </div>

          <div className="panel" style={{ padding: 16, lineHeight: 1.7 }}>
            {detail.ocr_extracted_text
              ? 'This report has OCR text stored in backend and is being shown live here.'
              : 'No OCR-extracted text was found for this report in backend.'}
          </div>
        </section>
      </aside>

      <style>{`@media (max-width:980px){ .grid[style*='1.2fr .8fr']{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}