export const getItem = <T>(key: string, defaultValue: T) => {
  const item = localStorage.getItem(key);
  if (!item) {
    return defaultValue;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
};

export const setItem = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};
