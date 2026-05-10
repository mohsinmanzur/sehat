import { Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatients,
  getPatientByEmail,
  getPatientById,
  getPatientByName,
} from "../services/patientService";

type Patient = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  blood_group?: string;
};

const toArray = (payload: any): Patient[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object") return [payload];
  return [];
};

export default function AccessPatientPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "email" | "id">("name");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();
      setPatients(toArray(data));
    } catch (err) {
      console.error(err);
      setError("Could not load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPatients();
  }, []);

  const handleSearch = async () => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      loadAllPatients();
      return;
    }

    try {
      setSearching(true);
      setError("");

      let data;

      if (searchType === "email") {
        data = await getPatientByEmail(cleanQuery);
      } else if (searchType === "id") {
        data = await getPatientById(cleanQuery);
      } else {
        data = await getPatientByName(cleanQuery);
      }

      setPatients(toArray(data));
    } catch (err) {
      console.error(err);
      setPatients([]);
      setError("No patient found for this search.");
    } finally {
      setSearching(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    localStorage.setItem("selectedPatientId", patient.id || "");
    localStorage.setItem("selectedPatientName", patient.name || "Selected Patient");
    navigate("/overview");
  };

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">Access Patient</h1>
        <p className="section-subtitle">
          Search patients by name, email, or ID using backend search.
        </p>

        <div
          className="panel"
          style={{
            padding: 16,
            marginTop: 20,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr auto",
              gap: 12,
            }}
          >
            <select
              className="input"
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as "name" | "email" | "id")
              }
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="id">Patient ID</option>
            </select>

            <input
              className="input"
              placeholder={`Search by ${searchType}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <button className="btn btn-primary" onClick={handleSearch}>
              <Search size={16} />
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: "fit-content" }}
            onClick={() => {
              setQuery("");
              loadAllPatients();
            }}
          >
            Show All Patients
          </button>
        </div>

        {loading && (
          <div className="muted" style={{ marginTop: 20 }}>
            Loading patients...
          </div>
        )}

        {error && (
          <div className="panel" style={{ padding: 16, color: "tomato", marginTop: 20 }}>
            {error}
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="panel" style={{ padding: 16, marginTop: 20 }}>
            No patients found.
          </div>
        )}

        {!loading && patients.length > 0 && (
          <div className="grid" style={{ marginTop: 20 }}>
            {patients.map((patient) => (
              <button
                key={patient.id}
                className="panel"
                onClick={() => selectPatient(patient)}
                style={{
                  padding: 18,
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  background: "var(--surface)",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: "var(--primary-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--primary)",
                    }}
                  >
                    <UserRound size={21} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {patient.name || "Unnamed Patient"}
                    </div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {patient.email || "No email"}{" "}
                      {patient.blood_group ? `· ${patient.blood_group}` : ""}
                    </div>
                  </div>
                </div>

                <span className="badge primary">Open</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 800px) {
          .panel div[style*="160px 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}