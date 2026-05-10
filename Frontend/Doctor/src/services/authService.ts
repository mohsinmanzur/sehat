import api, { saveTokens } from "./api";

type RegisterDoctorPayload = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  gender?: string;
  phone: string;
  license_number: string;
  associated_hospital?: string;
  specialization?: string;
};

export const requestCode = async (email: string) => {
  const res = await api.post("/auth/requestcode", { email });
  return res.data;
};

export const verifyDoctorCode = async (email: string, code: string) => {
  const res = await api.post("/auth/doctor/verifycode", { email, code });
  saveTokens(res.data);
  return res.data;
};

export const registerDoctor = async (payload: RegisterDoctorPayload) => {
  const name =
    payload.name ||
    `${payload.firstName || ""} ${payload.lastName || ""}`.trim();

  const body = {
    name,
    email: payload.email,
    gender: payload.gender || "other",
    phone: payload.phone,
    license_number: payload.license_number,
    associated_hospital: payload.associated_hospital || "",
    specialization: payload.specialization || "",
  };

  const res = await api.post("/auth/doctor/register", body);
  saveTokens(res.data);
  return res.data;
};

export const verifyDoctorAccount = async (email: string) => {
  const res = await api.post("/auth/doctor/verifyaccount", { email });
  return res.data;
};

export const refreshToken = async () => {
  const res = await api.post("/auth/refresh");
  saveTokens(res.data);
  return res.data;
};

export const googleLogin = async (idToken: string) => {
  const res = await api.post("/auth/google", { idToken });
  saveTokens(res.data);
  return res.data;
};