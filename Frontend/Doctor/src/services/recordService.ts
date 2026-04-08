import api from "./api";

export const getPatientRecords = async (patientId?: string) => {
  const url = patientId ? `/record?patient_id=${patientId}` : "/record";
  const res = await api.get(url);
  return res.data;
};