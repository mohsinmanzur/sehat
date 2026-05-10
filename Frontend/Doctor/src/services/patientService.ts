import api from "./api";

export const getPatients = async () => {
  const res = await api.get("/patient");
  return res.data;
};

export const getPatientById = async (id: string) => {
  const res = await api.get("/patient", {
    params: { id },
  });
  return res.data;
};

export const getPatientByEmail = async (email: string) => {
  const res = await api.get("/patient", {
    params: { email },
  });
  return res.data;
};

export const getPatientByName = async (name: string) => {
  const res = await api.get("/patient", {
    params: { name },
  });
  return res.data;
};