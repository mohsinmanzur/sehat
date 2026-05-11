import {
  Bell,
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  TimerReset,
  UserRound,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import Logo from "./Logo";
import { startPatientSession } from "../utils/session";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/overview", label: "Patient Overview", icon: UserRound },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/sessions", label: "Sessions", icon: TimerReset },
  { to: "/settings", label: "Settings", icon: Settings },
];

const pageMeta: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Welcome back", title: "Dashboard" },
  "/overview": { eyebrow: "Welcome back", title: "Patient Overview" },
  "/reports": { eyebrow: "Welcome back", title: "Reports" },
  "/sessions": { eyebrow: "Welcome back", title: "Sessions" },
  "/settings": { eyebrow: "Welcome back", title: "Settings" },
};

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleTheme } = useTheme();
  const { doctorName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [patientOtp, setPatientOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const currentMeta = useMemo(() => {
    return pageMeta[location.pathname] || {
      eyebrow: "Welcome back",
      title: "Dashboard",
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openOtpModal = () => {
    setOtpModalOpen(true);
    setPatientOtp("");
    setOtpError("");
    setOtpMessage("");
  };

  const closeOtpModal = () => {
    setOtpModalOpen(false);
    setPatientOtp("");
    setOtpError("");
    setOtpMessage("");
    setOtpLoading(false);
  };

  const startSessionFromOtp = async () => {
  try {
    setOtpLoading(true);
    setOtpError("");
    setOtpMessage("");

    const session = await startPatientSession(patientOtp);

    setOtpMessage(
      `Session started for ${session.patientName}. ${session.measurements.length} shared measurement(s), ${session.reports.length} report(s).`
    );

    setTimeout(() => {
      closeOtpModal();
      navigate("/overview");
    }, 500);
  } catch (err: any) {
    console.error(err);
    setOtpError(err.message || "Invalid OTP or session could not be started.");
  } finally {
    setOtpLoading(false);
  }
};

  useEffect(() => {
    const handler = () => openOtpModal();
    window.addEventListener("open-patient-otp-modal", handler);

    return () => {
      window.removeEventListener("open-patient-otp-modal", handler);
    };
  }, []);

  const alerts = [
    "Session access is read-only.",
    "Reports are visible only during active patient sessions.",
    "Use patient OTP to start a secure session.",
  ];

  return (
    <div className="app-bg mobile-bottom-space">
      <div className="container" style={{ padding: "12px 0 24px" }}>
        <div className="shell-grid-premium">
          <aside className={`card sidebar-premium ${open ? "open" : ""}`}>
            <div className="sidebar-top">
              <Logo compact />
              <button className="btn btn-secondary sidebar-close" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="panel sidebar-user-card">
              <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Signed in as
              </div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{doctorName}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Sehat doctor portal
              </div>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <button className="btn btn-secondary sidebar-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <main className="shell-main">
            <header className="card shell-header-clean">
              <div className="shell-header-left">
                <button className="btn btn-secondary mobile-menu-btn" onClick={() => setOpen(true)}>
                  <Menu size={18} />
                </button>

                <div>
                  <div className="shell-eyebrow">{currentMeta.eyebrow}</div>
                  <div className="shell-title-custom">Hello, {doctorName}</div>
                </div>
              </div>

              <div className="shell-header-actions">
                <button type="button" className="btn btn-primary shell-top-cta" onClick={openOtpModal}>
                  <ClipboardPlus size={18} />
                  Enter Patient OTP
                </button>

                <button className="btn btn-secondary icon-btn" onClick={toggleTheme}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="alerts-anchor">
                  <button className="btn btn-secondary icon-btn" onClick={() => setShowAlerts((prev) => !prev)}>
                    <Bell size={18} />
                  </button>

                  {showAlerts && (
                    <div className="alerts-dropdown card">
                      <div className="alerts-head">Recent Alerts</div>
                      <div className="alerts-list">
                        {alerts.map((alert) => (
                          <div key={alert} className="panel alerts-item">
                            {alert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      {showAlerts && <div className="alerts-overlay" onClick={() => setShowAlerts(false)} />}

      {otpModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.72)",
            display: "grid",
            placeItems: "center",
            zIndex: 300,
            padding: 16,
          }}
          onClick={closeOtpModal}
        >
          <div
            className="card"
            style={{
              width: "min(100%, 540px)",
              padding: 24,
              borderRadius: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h2 className="section-title" style={{ fontSize: 34 }}>
                  Enter Patient OTP
                </h2>
                <p className="section-subtitle">
                  Enter the OTP shared by the patient to start a read-only session.
                </p>
              </div>

              <button className="btn btn-secondary" onClick={closeOtpModal} style={{ width: 46, height: 46, padding: 0, borderRadius: 16 }}>
                <X size={18} />
              </button>
            </div>

            <label style={{ fontWeight: 800, display: "block", marginBottom: 8 }}>
              Patient OTP
            </label>

            <input
              className="input"
              placeholder="Enter patient OTP"
              value={patientOtp}
              onChange={(e) => setPatientOtp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startSessionFromOtp();
              }}
              autoFocus
            />

            {otpError && (
              <div className="panel" style={{ padding: 14, marginTop: 14, color: "tomato" }}>
                {otpError}
              </div>
            )}

            {otpMessage && (
              <div className="panel" style={{ padding: 14, marginTop: 14 }}>
                {otpMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={startSessionFromOtp} disabled={otpLoading}>
                {otpLoading ? "Starting..." : "Start Session"}
              </button>

              <button className="btn btn-secondary" onClick={closeOtpModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}