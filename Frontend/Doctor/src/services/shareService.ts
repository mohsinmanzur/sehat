import api from "./api";

export type SharedMeasurement = {
  id?: string;
  patient_id?: string;
  unit_id?: string;
  document_id?: string | null;
  numeric_value?: number;
  created_at?: string;
  updated_at?: string;
  patient?: {
    id?: string;
    name?: string;
    email?: string;
  };
  measurement_unit?: {
    id?: string;
    unit_name?: string;
    symbol?: string;
    measurement_group?: string;
  };
};

export const getShareMeasurements = async (shareId: string) => {
  const res = await api.get("/share/shares", {
    params: { share_id: shareId },
  });

  return res.data;
};

export const revokeShare = async ({
  patientId,
  shareId,
}: {
  patientId: string;
  shareId: string;
}) => {
  const res = await api.post(
    "/share/revoke",
    {},
    {
      params: {
        patient_id: patientId,
        share_id: shareId,
      },
    }
  );

  return res.data;
};