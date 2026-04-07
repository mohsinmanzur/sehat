import { useEffect, useState } from 'react';
import { getPatientRecords } from '../services/recordService';

export default function ReportsPage() {
  const patientId = localStorage.getItem("selectedPatientId");

  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPatientRecords(patientId);

        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;

        setReports(list);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [patientId]);

  return (
    <div className="grid">
      <section className="card" style={{ padding: 24 }}>

        <h1 className="section-title">Reports</h1>

        <div className="grid" style={{ marginTop: 20 }}>
          {reports.map((r, i) => (
            <div key={i} className="panel" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700 }}>
                {r.name || r.title}
              </div>
              <div className="muted">
                {r.date}
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}