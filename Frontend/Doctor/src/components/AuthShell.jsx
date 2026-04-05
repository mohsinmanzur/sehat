import { Moon, Sun } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';

export default function AuthShell({ children, footer = true }) {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div className="app-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 0', position: 'relative', zIndex: 2 }}>
        <Logo compact />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ width: 48, height: 48, borderRadius: 999, padding: 0 }}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          <span className="muted" style={{ fontWeight: 600 }}>Doctor Portal</span>
        </div>
      </header>
      <main className="container" style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '12px 0 32px' }}>{children}</main>
      {footer && (
        <footer style={{ padding: '0 0 26px', textAlign: 'center' }}>
          <div className="muted" style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13 }}>
            <span>Terms</span><span>Privacy</span><span>Support</span>
          </div>
        </footer>
      )}
    </div>
  );
}
