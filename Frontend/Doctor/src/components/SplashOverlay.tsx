import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'linear-gradient(135deg, #2A5CFF, #3f6fff)', display: 'grid', placeItems: 'center' }}>
      <div style={{ transform: 'scale(1.02)', color: '#fff' }}>
        <Logo />
      </div>
    </div>
  );
}
