import api from "./api";

export const getPatientRecords = async (patientId: string) => {
  const res = await api.get(`/record?patient_id=${patientId}`);
  return res.data;
};