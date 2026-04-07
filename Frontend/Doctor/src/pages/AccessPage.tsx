import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../services/patientService';

export default function AccessPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPatients();

        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.data)) list = data.data;

        setPatients(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = patients.filter((p) => {
    const name = (p.name || p.fullName || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const selectPatient = (p) => {
    localStorage.setItem("selectedPatientId", p.id || p._id);
    localStorage.setItem("selectedPatientName", p.name || p.fullName);
    navigate("/overview");
  };

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>

        <h1 className="section-title">Select Patient</h1>
        <p className="section-subtitle">Choose a patient to view their data</p>

        <input
          className="input"
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginTop: 16 }}
        />

        {loading && <p style={{ marginTop: 20 }}>Loading...</p>}

        <div className="grid" style={{ marginTop: 20 }}>
          {filtered.map((p) => (
            <div
              key={p.id || p._id}
              className="panel"
              style={{ padding: 16, cursor: "pointer" }}
              onClick={() => selectPatient(p)}
            >
              <div style={{ fontWeight: 700 }}>
                {p.name || p.fullName}
              </div>
              <div className="muted">
                {p.email}
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}