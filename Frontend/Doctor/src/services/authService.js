import api from "./api";

export const requestCode = async (email) => {
  const res = await api.post("/auth/requestcode", { email });
  return res.data;
};

export const verifyCode = async (email, code) => {
  const res = await api.post("/auth/verifycode", {
    email,
    code,
  });
  return res.data;
};