import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import LoginPage from './pages/LoginPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import AccessPage from './pages/AccessPage';
import OverviewPage from './pages/OverviewPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';
import AppShell from './components/AppShell';
import SplashOverlay from './components/SplashOverlay';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isVerified } = useAuth();
  return isVerified ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const isAuthRoute = ['/login', '/verify'].includes(location.pathname);
  const shell = useMemo(
    () => ({
      dashboard: <DashboardPage />,
      access: <AccessPage />,
      overview: <OverviewPage />,
      reports: <ReportsPage />,
      sessions: <SessionsPage />,
      settings: <SettingsPage />,
      reportDetail: <ReportDetailPage />,
    }),
    []
  );

  return (
    <>
      {location.pathname === '/login' && <SplashOverlay />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><AppShell>{shell.dashboard}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/access"
          element={<ProtectedRoute><AppShell>{shell.access}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/overview"
          element={<ProtectedRoute><AppShell>{shell.overview}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute><AppShell>{shell.reports}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/reports/:id"
          element={<ProtectedRoute><AppShell>{shell.reportDetail}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/sessions"
          element={<ProtectedRoute><AppShell>{shell.sessions}</AppShell></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><AppShell>{shell.settings}</AppShell></ProtectedRoute>}
        />
      </Routes>
    </>
  );
}
