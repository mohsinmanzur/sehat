import logo from "../assets/Sehat Logo.png";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={logo}
        alt="Sehat Logo"
        style={{
          width: compact ? 46 : 58,
          height: compact ? 46 : 58,
          objectFit: "contain",
          borderRadius: 14,
        }}
      />

      <div
        style={{
          fontSize: compact ? 22 : 28,
          fontWeight: 900,
          color: "var(--text)",
          letterSpacing: "-0.04em",
        }}
      >
        Sehat
      </div>
    </div>
  );
}