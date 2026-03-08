export type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  muted: string;
  danger: string;
  warning: string;
  success: string;
};

export type AppTheme = {
  dark: boolean;
  colors: ThemeColors;
};

export type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};