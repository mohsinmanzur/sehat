import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextType
{
    darkMode: boolean;
    toggleTheme: () => void;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('sehatscan-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('sehatscan-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const value = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode((v) => !v) }), [darkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
