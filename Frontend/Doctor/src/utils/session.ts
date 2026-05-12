import { getShareByAccessCode } from "../services/shareService";
import { addNotification } from "./notifications";

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.measurements)) return payload.measurements;
  if (Array.isArray(payload?.sharedMeasurements)) return payload.sharedMeasurements;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

const getPatientFromResponse = (payload: any) => {
  if (payload?.patient) return payload.patient;
  if (payload?.data?.patient) return payload.data.patient;
  if (payload?.share?.patient) return payload.share.patient;
  if (payload?.data?.share?.patient) return payload.data.share.patient;
  return null;
};

const getShareFromResponse = (payload: any) => {
  if (payload?.share) return payload.share;
  if (payload?.data?.share) return payload.data.share;
  if (payload?.accessGrant) return payload.accessGrant;
  if (payload?.data?.accessGrant) return payload.data.accessGrant;
  return null;
};

export const clearPatientSession = (emitEvent = true) => {
  localStorage.removeItem("activeShareId");
  localStorage.removeItem("activeAccessCode");
  localStorage.removeItem("activeAccessToken");
  localStorage.removeItem("selectedPatientId");
  localStorage.removeItem("selectedPatientName");
  localStorage.removeItem("activeSharedMeasurements");
  localStorage.removeItem("activeSharedReports");

  addNotification({
  title: "Session ended",
  message: "The current patient session was closed.",
  type: "session",
  });

  if (emitEvent) {
    window.dispatchEvent(new CustomEvent("session-ended"));
  }
};

export const startPatientSession = async (otp: string) => {
  const accessCode = otp.trim();

  if (!accessCode) {
    throw new Error("Please enter the patient OTP.");
  }

  clearPatientSession(false);

  console.log("Starting patient session with access_code:", accessCode);

  const response = await getShareByAccessCode(accessCode);

  console.log("Shared by code response:", response);

  const patient = getPatientFromResponse(response);
  const share = getShareFromResponse(response);

  const measurements = toArray(response?.measurements || response?.data?.measurements);
  const reports = toArray(response?.reports || response?.records || response?.data?.reports || response?.data?.records);

  const patientId =
    patient?.id ||
    patient?.patient_id ||
    share?.patient_id ||
    measurements?.[0]?.patient_id ||
    measurements?.[0]?.patient?.id ||
    "";

  const patientName =
    patient?.name ||
    patient?.fullName ||
    patient?.email ||
    measurements?.[0]?.patient?.name ||
    "Shared Patient";

  if (!patientId) {
    throw new Error("Session found, but patient_id is missing in backend response.");
  }

  localStorage.setItem("activeShareId", share?.id || response?.id || accessCode);
  localStorage.setItem("activeAccessCode", accessCode);
  localStorage.setItem("activeAccessToken", accessCode);
  localStorage.setItem("selectedPatientId", patientId);
  localStorage.setItem("selectedPatientName", patientName);
  localStorage.setItem("activeSharedMeasurements", JSON.stringify(measurements));
  localStorage.setItem("activeSharedReports", JSON.stringify(reports));

  saveTodayInsights({
  patientId,
  reportsCount: reports.length,
  measurementsCount: measurements.length,
  });

  window.dispatchEvent(new CustomEvent("session-started"));

  return {
    shareId: share?.id || response?.id || accessCode,
    accessCode,
    patientId,
    patientName,
    measurements,
    reports,
  };

  addNotification({
  title: "Session started",
  message: `Session started with ${patientName}. ${measurements.length} measurement(s) and ${reports.length} report(s) shared.`,
  type: "session",
});

if (reports.length > 0) {
  addNotification({
    title: "Reports shared",
    message: `${reports.length} report(s) available for ${patientName}.`,
    type: "report",
  });
}

if (measurements.length > 0) {
  addNotification({
    title: "Measurements shared",
    message: `${measurements.length} measurement(s) available for ${patientName}.`,
    type: "measurement",
  });
}
};

export const getActiveSession = () => {
  return {
    shareId: localStorage.getItem("activeShareId") || "",
    accessCode: localStorage.getItem("activeAccessCode") || "",
    accessToken: localStorage.getItem("activeAccessToken") || "",
    patientId: localStorage.getItem("selectedPatientId") || "",
    patientName: localStorage.getItem("selectedPatientName") || "Shared Patient",
    measurements: JSON.parse(localStorage.getItem("activeSharedMeasurements") || "[]"),
    reports: JSON.parse(localStorage.getItem("activeSharedReports") || "[]"),
  };
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const saveTodayInsights = ({
  patientId,
  reportsCount,
  measurementsCount,
}: {
  patientId: string;
  reportsCount: number;
  measurementsCount: number;
}) => {
  const key = `doctorTodayInsights:${todayKey()}`;

  const existing = JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({
        patientIds: [],
        reportsShared: 0,
        measurementsTracked: 0,
      })
  );

  const patientIds: string[] = existing.patientIds || [];

  if (!patientIds.includes(patientId)) {
    patientIds.push(patientId);
  }

  localStorage.setItem(
    key,
    JSON.stringify({
      patientIds,
      reportsShared: Number(existing.reportsShared || 0) + reportsCount,
      measurementsTracked: Number(existing.measurementsTracked || 0) + measurementsCount,
    })
  );
};

export const getTodayInsights = () => {
  const key = `doctorTodayInsights:${todayKey()}`;

  const data = JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({
        patientIds: [],
        reportsShared: 0,
        measurementsTracked: 0,
      })
  );

  return {
    patientsToday: data.patientIds?.length || 0,
    reportsShared: data.reportsShared || 0,
    measurementsTracked: data.measurementsTracked || 0,
  };
};