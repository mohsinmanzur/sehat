import api from "./api";

export const getHealthMeasurements = async (patientId: string) => {
  const res = await api.get(`/health-measurement?patient_id=${patientId}`);
  return res.data;
};