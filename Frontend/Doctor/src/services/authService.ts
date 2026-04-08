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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license_number: string;
  associated_hospital?: string;
  specialization?: string;
}) => {
  const payload = {
    name: `${doctorData.firstName} ${doctorData.lastName}`.trim(),
    email: doctorData.email,
    phone: doctorData.phone,
    license_number: doctorData.license_number,
    associated_hospital: doctorData.associated_hospital || "",
    specialization: doctorData.specialization || "",
  };

  const res = await api.post("/auth/doctor/register", payload);
  return res.data;
};

export const verifyDoctorAccount = async (email: string) => {
  const res = await api.post("/auth/doctor/verifyaccount", { email });
  return res.data;
};