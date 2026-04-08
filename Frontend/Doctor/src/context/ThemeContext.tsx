import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return true;
  });

  useEffect(() => {
    const html = document.documentElement;

    if (darkMode) {
      html.classList.add('theme-dark');
    } else {
      html.classList.remove('theme-dark');
    }

    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const value = useMemo(
    () => ({
      darkMode,
      toggleTheme: () => setDarkMode((prev) => !prev),
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
};