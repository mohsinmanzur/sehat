import api from "./api";

export const requestCode = async (email: string) => {
  const res = await api.post("/auth/requestcode", { email });
  console.log(res);
  return res.data;
};

export const verifyCode = async (email: string, code: string) => {
  const res = await api.post("/auth/verifycode", {
    email,
    code,
  });
  return res.data;
};