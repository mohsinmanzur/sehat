import api from "./api";

export const getPatientRecords = async (patientId?: string) => {
  const res = await api.get("/record", {
    params: patientId ? { patient_id: patientId } : {},
  });

  return res.data;
};

export const getRecordById = async (recordId: string) => {
  const res = await api.get("/record", {
    params: { id: recordId },
  });

  return res.data;
};

export const getDocumentUrlByMeasurementId = async (measurementId: string) => {
  const res = await api.get("/record/document-url", {
    params: { id: measurementId },
  });

  return res.data;
};

export const getSecureRecordUrl = async (fileUrl: string) => {
  const res = await api.post("/record/image/get-secure-url", {
    file_url: fileUrl,
  });

  return res.data;
};

export const openRecordFile = async (recordOrUrl: any) => {
  const rawUrl =
    typeof recordOrUrl === "string"
      ? recordOrUrl
      : recordOrUrl?.file_url ||
        recordOrUrl?.url ||
        recordOrUrl?.document_url ||
        recordOrUrl?.secure_url ||
        "";

  if (!rawUrl) {
    throw new Error("No file URL found.");
  }

  try {
    const secureRes = await getSecureRecordUrl(rawUrl);
    const secureUrl =
      secureRes?.url ||
      secureRes?.secure_url ||
      secureRes?.file_url ||
      rawUrl;

    window.open(secureUrl, "_blank", "noopener,noreferrer");
    return secureUrl;
  } catch (err) {
    console.error("Secure URL failed, opening raw URL:", err);
    window.open(rawUrl, "_blank", "noopener,noreferrer");
    return rawUrl;
  }
};