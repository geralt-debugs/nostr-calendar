import { RepeatingFrequency } from "./types";

export const getRepeatFrequency = (
  repeatValue: string,
): RepeatingFrequency | null => {
  const value = Object.values(RepeatingFrequency).find(
    (val) => val === repeatValue,
  );
  if (!value) {
    return null;
  }
  return value as RepeatingFrequency;
};
