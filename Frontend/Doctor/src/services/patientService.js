import api from "./api";

export const getPatients = async () => {
  const res = await api.get("/patient");
  return res.data;
};