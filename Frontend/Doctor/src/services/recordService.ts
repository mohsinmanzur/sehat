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