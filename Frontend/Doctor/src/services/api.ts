import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

const api = axios.create({
  baseURL: API_BASE_URL,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
});

const getAccessToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("doctorToken") ||
    ""
  );
};

const getRefreshToken = () => {
  return localStorage.getItem("refresh_token") || "";
};

const saveTokens = (data: any) => {
  const accessToken =
    data?.access_token ||
    data?.accessToken ||
    data?.jwt ||
    data?.token ||
    "";

  const refreshToken =
    data?.refresh_token ||
    data?.refreshToken ||
    "";

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("doctorToken", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  }
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const refreshRes = await refreshApi.post(
          "/auth/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${getRefreshToken()}`,
            },
          }
        );

        saveTokens(refreshRes.data);

        const newToken = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("doctorToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { saveTokens };
export default api;