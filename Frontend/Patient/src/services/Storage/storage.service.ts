import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Storing a String
export const storeString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Error storing string:', e);
  }
};

// 2. Storing an Object (Requires Serialization)
export const storeObject = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing object:', e);
  }
};

// 3. Reading a String
export const getString = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value; // Returns string or null
  } catch (e) {
    console.error('Error reading string:', e);
    return null;
  }
};

// 4. Reading an Object (Requires Parsing)
export const getObject = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading object:', e);
    return null;
  }
};

// 5. Removing Data
export const removeValue = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing value:', e);
  }
};

// 6. Clearing All Data (Use with caution)
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
};