import api from "./api";

export const getPatients = async () => {
  const res = await api.get("/patient");
  return res.data;
};

export const getPatientById = async (id: string) => {
  const res = await api.get(`/patient?id=${encodeURIComponent(id)}`);
  return res.data;
};

export const getPatientByEmail = async (email: string) => {
  const res = await api.get(`/patient?email=${encodeURIComponent(email)}`);
  return res.data;
};

export const getPatientByName = async (name: string) => {
  const res = await api.get(`/patient?name=${encodeURIComponent(name)}`);
  return res.data;
};