import api from "./api";

export const getHealthMeasurements = async (patientId?: string) => {
  const url = patientId
    ? `/health-measurement?patient_id=${patientId}`
    : "/health-measurement";

  const res = await api.get(url);
  return res.data;
};