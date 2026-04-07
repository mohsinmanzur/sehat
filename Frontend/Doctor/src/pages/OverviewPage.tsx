import { useEffect, useState } from 'react';
import { getHealthMeasurements } from '../services/measurementService';

export default function OverviewPage() {
  const patientId = localStorage.getItem("selectedPatientId");
  const patientName = localStorage.getItem("selectedPatientName");

  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getHealthMeasurements(patientId);

        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;

        setData(list);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [patientId]);

  return (
    <div className="grid">

      <section className="card" style={{ padding: 24 }}>
        <h1 className="section-title">{patientName}</h1>
        <p className="section-subtitle">Health Overview</p>

        <div className="grid" style={{ marginTop: 20 }}>
          {data.map((item, i) => (
            <div key={i} className="panel" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700 }}>
                {item.name || item.type}
              </div>
              <div style={{ fontSize: 24 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}