import { HeartPulse } from 'lucide-react';

export default function Logo({ compact = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: compact ? 40 : 52, height: compact ? 40 : 52, borderRadius: 16, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 12px 24px rgba(42,92,255,.22)' }}>
        <HeartPulse size={compact ? 20 : 26} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: compact ? 20 : 28, letterSpacing: '-.03em' }}>Sehat Scan</div>
        {!compact && <div style={{ color: 'var(--text-light)', letterSpacing: '.28em', fontSize: 12, textTransform: 'uppercase' }}>Digitizing Health</div>}
      </div>
    </div>
  );
}
