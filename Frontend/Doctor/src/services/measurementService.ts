import api from "./api";

export const getHealthMeasurements = async (patientId?: string) => {
  const res = await api.get("/health-measurement", {
    params: patientId ? { patient_id: patientId } : {},
  });

  return res.data;
};

export const getHealthMeasurementById = async (id: string) => {
  const res = await api.get("/health-measurement", {
    params: { id },
  });

  return res.data;
};

export const getMeasurementUnits = async () => {
  const res = await api.get("/health-measurement/unit");
  return res.data;
};

export const getReferenceRanges = async (unitId?: string) => {
  const res = await api.get("/health-measurement/reference-ranges", {
    params: unitId ? { unit_id: unitId } : {},
  });

  return res.data;
};