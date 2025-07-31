import { create } from "zustand";
import { getItem, setItem } from "../common/localStorage";
import { isMobile } from "../common/utils";

export interface ISettings {
  layout: "day" | "week" | "month";
}

const localStorageKey = "cal:settings";

const previousSettings = getItem<ISettings>(localStorageKey, {
  layout: "week",
});
if (isMobile) {
  previousSettings.layout = "day";
}

export const useSettings = create<{
  settings: ISettings;
  updateSetting: <T extends keyof ISettings>(
    setting: T,
    value: ISettings[T],
  ) => void;
}>((set) => ({
  settings: previousSettings,
  updateSetting: (setting, value) =>
    set(({ settings }) => {
      if (setting === "layout" && isMobile) {
        return { settings };
      }
      const newSettings = { ...settings, [setting]: value };
      setItem(localStorageKey, newSettings);
      return { settings: newSettings };
    }),
}));
