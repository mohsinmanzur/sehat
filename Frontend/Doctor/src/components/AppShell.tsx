import {
  Bell,
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  QrCode,
  Settings,
  Sun,
  TimerReset,
  UserRound,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { startPatientSession, validateActivePatientSession } from "../utils/session";
import {
  DoctorNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../utils/notifications";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/overview", label: "Patient Overview", icon: UserRound },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/sessions", label: "Sessions", icon: TimerReset },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { darkMode, toggleTheme } = useTheme();
  const { doctorName, doctorFullName, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const [notifications, setNotifications] = useState<DoctorNotification[]>([]);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [patientOtp, setPatientOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const unreadCount = notifications.filter((item) => !item.read).length;

  const pageTitle = useMemo(() => {
    if (location.pathname.includes("overview")) return "Patient Overview";
    if (location.pathname.includes("reports")) return "Reports";
    if (location.pathname.includes("sessions")) return "Sessions";
    if (location.pathname.includes("settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotifications());
    };

    loadNotifications();

    window.addEventListener("doctor-notifications-updated", loadNotifications);

    return () => {
      window.removeEventListener("doctor-notifications-updated", loadNotifications);
    };
  }, []);

  useEffect(() => {
    const openOtpHandler = () => {
      openOtpModal();
    };

    window.addEventListener("open-patient-otp-modal", openOtpHandler);

    return () => {
      window.removeEventListener("open-patient-otp-modal", openOtpHandler);
    };
  }, []);

  useEffect(() => {
  const checkSession = async () => {
    const stillValid = await validateActivePatientSession();

    if (!stillValid) {
      window.dispatchEvent(new CustomEvent("doctor-notifications-updated"));

      if (
        location.pathname.includes("overview") ||
        location.pathname.includes("reports")
      ) {
        navigate("/dashboard");
      }
    }
  };

  checkSession();
}, []);

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

  const handleStartSession = async () => {
    try {
      setOtpLoading(true);
      setOtpError("");
      setOtpMessage("");

      const session = await startPatientSession(patientOtp);

      setOtpMessage(
        `Session started for ${session.patientName}. ${session.measurements.length} measurement(s), ${session.reports.length} report(s).`
      );

      setTimeout(() => {
        closeOtpModal();
        navigate("/overview");
      }, 600);
    } catch (err: any) {
      console.error(err);
      setOtpError(err?.message || "Invalid OTP or session could not be started.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    logout();
    navigate("/login");
  };

  return (
    <div className="app-bg mobile-bottom-space">
      <div className="container" style={{ padding: "12px 0 24px" }}>
        <div className="shell-grid-premium">
          <aside className={`card sidebar-premium ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-top">
              <Logo compact />

              <button
                type="button"
                className="btn btn-secondary sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="panel sidebar-user-card">
              <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Signed in as
              </div>

              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {doctorName || "Doctor"}
              </div>

              <div className="muted" style={{ marginTop: 4 }}>
                {doctorFullName || "Sehat doctor portal"}
              </div>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="btn btn-secondary sidebar-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <main className="shell-main">
            <header className="card shell-header-clean">
              <div className="shell-header-left">
                <button
                  type="button"
                  className="btn btn-secondary mobile-menu-btn"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>

                <div>
                  <div className="shell-eyebrow">Welcome back</div>
                  <div className="shell-title-custom">
                    {pageTitle === "Dashboard" ? `Hello, ${doctorName || "Doctor"}` : pageTitle}
                  </div>
                </div>
              </div>

              <div className="shell-header-actions">
                <button
                  type="button"
                  className="btn btn-primary shell-top-cta"
                  onClick={openOtpModal}
                >
                  <ClipboardPlus size={18} />
                  Enter Patient OTP
                </button>

                <button
                  type="button"
                  className="btn btn-secondary icon-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-qr-modal"))}
                  aria-label="Scan QR"
                >
                  <QrCode size={18} />
                </button>

                <div className="alerts-anchor">
                  <button
                    type="button"
                    className="btn btn-secondary icon-btn"
                    onClick={() => setShowAlerts((prev) => !prev)}
                    style={{ position: "relative" }}
                    aria-label="Open notifications"
                  >
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 7,
                          right: 7,
                          minWidth: 18,
                          height: 18,
                          padding: "0 5px",
                          borderRadius: 999,
                          background: "var(--danger)",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 900,
                          display: "grid",
                          placeItems: "center",
                          lineHeight: 1,
                          border: "2px solid var(--card)",
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showAlerts && (
                    <div className="alerts-dropdown card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <div className="alerts-head">Notifications</div>

                          <div className="muted" style={{ fontSize: 13 }}>
                            {unreadCount > 0
                              ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`
                              : "All caught up"}
                          </div>
                        </div>

                        {notifications.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{
                              minHeight: 36,
                              padding: "0 12px",
                              borderRadius: 12,
                              fontSize: 13,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllNotificationsRead();
                              setNotifications(getNotifications());
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="alerts-list">
                        {notifications.length === 0 ? (
                          <div className="panel alerts-item">
                            <div style={{ fontWeight: 900, color: "var(--text)" }}>
                              No notifications yet
                            </div>

                            <div className="muted" style={{ marginTop: 4 }}>
                              Patient session updates will appear here.
                            </div>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              className="panel alerts-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationRead(item.id);
                                setNotifications(getNotifications());
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                cursor: "pointer",
                                borderColor: item.read ? "var(--border)" : "var(--primary)",
                                background: item.read ? "var(--surface-soft)" : "var(--card)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 10,
                                  alignItems: "flex-start",
                                }}
                              >
                                <div style={{ fontWeight: 900, color: "var(--text)" }}>
                                  {item.title}
                                </div>

                                {!item.read && (
                                  <span
                                    style={{
                                      width: 9,
                                      height: 9,
                                      borderRadius: 999,
                                      background: "var(--primary)",
                                      flexShrink: 0,
                                      marginTop: 6,
                                    }}
                                  />
                                )}
                              </div>

                              <div className="muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                                {item.message}
                              </div>

                              <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                                {new Date(item.createdAt).toLocaleString()}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary icon-btn"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {showAlerts && (
        <div className="alerts-overlay" onClick={() => setShowAlerts(false)} />
      )}

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 18,
              }}
            >
              <div>
                <h2 className="section-title" style={{ fontSize: 34 }}>
                  Enter Patient OTP
                </h2>
                <p className="section-subtitle">
                  Enter the OTP shared by the patient to start a read-only session.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeOtpModal}
                style={{ width: 46, height: 46, padding: 0, borderRadius: 16 }}
              >
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
                if (e.key === "Enter") handleStartSession();
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartSession}
                disabled={otpLoading}
              >
                {otpLoading ? "Starting..." : "Start Session"}
              </button>

              <button type="button" className="btn btn-secondary" onClick={closeOtpModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}