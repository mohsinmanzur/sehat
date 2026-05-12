const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

const prefix = 'sehat.secure.';

export async function getItemAsync(key) {
  if (!storage) return null;
  return storage.getItem(prefix + key);
}

export async function setItemAsync(key, value) {
  if (!storage) return;
  storage.setItem(prefix + key, value);
}

export async function deleteItemAsync(key) {
  if (!storage) return;
  storage.removeItem(prefix + key);
}

export const WHEN_UNLOCKED = 'whenUnlocked';
export const AFTER_FIRST_UNLOCK = 'afterFirstUnlock';
export const ALWAYS = 'always';
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'whenPasscodeSetThisDeviceOnly';
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'whenUnlockedThisDeviceOnly';
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'afterFirstUnlockThisDeviceOnly';
export const ALWAYS_THIS_DEVICE_ONLY = 'alwaysThisDeviceOnly';

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  WHEN_UNLOCKED,
  AFTER_FIRST_UNLOCK,
  ALWAYS,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  ALWAYS_THIS_DEVICE_ONLY,
};
