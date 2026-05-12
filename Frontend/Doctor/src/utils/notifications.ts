export type DoctorNotification = {
  id: string;
  title: string;
  message: string;
  type: "session" | "report" | "measurement" | "system";
  createdAt: string;
  read: boolean;
};

const STORAGE_KEY = "doctorNotifications";

const getStored = (): DoctorNotification[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveStored = (items: DoctorNotification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("doctor-notifications-updated"));
};

export const getNotifications = () => {
  return getStored();
};

export const addNotification = ({
  title,
  message,
  type = "system",
}: {
  title: string;
  message: string;
  type?: DoctorNotification["type"];
}) => {
  const newNotification: DoctorNotification = {
    id: crypto.randomUUID(),
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const existing = getStored();

  saveStored([newNotification, ...existing].slice(0, 30));

  return newNotification;
};

export const markNotificationRead = (id: string) => {
  const updated = getStored().map((item) =>
    item.id === id ? { ...item, read: true } : item
  );

  saveStored(updated);
};

export const markAllNotificationsRead = () => {
  const updated = getStored().map((item) => ({
    ...item,
    read: true,
  }));

  saveStored(updated);
};

export const clearNotifications = () => {
  saveStored([]);
};

export const getUnreadNotificationCount = () => {
  return getStored().filter((item) => !item.read).length;
};