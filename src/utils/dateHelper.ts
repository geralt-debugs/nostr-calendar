import dayjs, { Dayjs } from "dayjs";

export function isWeekend(date: string | Date | Dayjs): boolean {
  const d = dayjs(date);
  const day = d.day(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

export const formatDateTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString();
