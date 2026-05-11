import { getSessionByAccessToken } from "../services/shareService";

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.measurements)) return payload.measurements;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.reports)) return payload.reports;
  return [];
};

export const clearPatientSession = (emitEvent = true) => {
  localStorage.removeItem("activeShareId");
  localStorage.removeItem("activeAccessToken");
  localStorage.removeItem("selectedPatientId");
  localStorage.removeItem("selectedPatientName");
  localStorage.removeItem("activeSharedMeasurements");
  localStorage.removeItem("activeSharedReports");

  if (emitEvent) {
    window.dispatchEvent(new CustomEvent("session-ended"));
  }
};

export const startPatientSession = async (otp: string) => {
  const cleanOtp = otp.trim();

  if (!cleanOtp) {
    throw new Error("Please enter the patient OTP.");
  }

  clearPatientSession(false);

  console.log("Starting patient session with access_token:", cleanOtp);

  const sessionResponse = await getSessionByAccessToken(cleanOtp);

  console.log("Session response:", sessionResponse);

  const patient = sessionResponse?.patient || sessionResponse?.share?.patient || null;
  const share = sessionResponse?.share || null;

  const patientId =
    patient?.id ||
    share?.patient_id ||
    "";

  const patientName =
    patient?.name ||
    patient?.email ||
    "Shared Patient";

  if (!patientId) {
    throw new Error("Session found, but patient_id is missing.");
  }

  const measurements = toArray(sessionResponse?.measurements);
  const reports = toArray(sessionResponse?.reports);

  localStorage.setItem("activeShareId", share?.id || cleanOtp);
  localStorage.setItem("activeAccessToken", cleanOtp);
  localStorage.setItem("selectedPatientId", patientId);
  localStorage.setItem("selectedPatientName", patientName);
  localStorage.setItem("activeSharedMeasurements", JSON.stringify(measurements));
  localStorage.setItem("activeSharedReports", JSON.stringify(reports));

  window.dispatchEvent(new CustomEvent("session-started"));

  return {
    shareId: share?.id || cleanOtp,
    accessToken: cleanOtp,
    patientId,
    patientName,
    measurements,
    reports,
  };
};

export const getActiveSession = () => {
  return {
    shareId: localStorage.getItem("activeShareId") || "",
    accessToken: localStorage.getItem("activeAccessToken") || "",
    patientId: localStorage.getItem("selectedPatientId") || "",
    patientName: localStorage.getItem("selectedPatientName") || "Shared Patient",
    measurements: JSON.parse(localStorage.getItem("activeSharedMeasurements") || "[]"),
    reports: JSON.parse(localStorage.getItem("activeSharedReports") || "[]"),
  };
};