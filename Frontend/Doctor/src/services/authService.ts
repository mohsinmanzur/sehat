import api from "./api";

export const requestCode = async (email: string) => {
  const res = await api.post("/auth/requestcode", { email });
  return res.data;
};

export const verifyDoctorCode = async (email: string, code: string) => {
  const res = await api.post("/auth/doctor/verifycode", {
    email,
    code,
  });
  return res.data;
};

export const registerDoctor = async (doctorData: {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  associated_hospital?: string;
  specialization?: string;
}) => {
  const res = await api.post("/auth/doctor/register", doctorData);
  return res.data;
};

export const verifyDoctorAccount = async (email: string) => {
  const res = await api.post("/auth/doctor/verifyaccount", { email });
  return res.data;
};