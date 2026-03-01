import { create } from "zustand";
import { getItem, setItem } from "../common/localStorage";

const RELAYS_STORAGE_KEY = "cal:relays";

export const useRelayStore = create<{
  relays: string[];
  isLoaded: boolean;
  showRelayModal: boolean;
  setRelays: (relays: string[]) => void;
  resetRelays: () => void;
  updateRelayModal: (show: boolean) => void;
}>((set) => ({
  relays: getItem<string[]>(RELAYS_STORAGE_KEY, []),
  isLoaded: false,
  showRelayModal: false,
  setRelays: (relays) => {
    setItem(RELAYS_STORAGE_KEY, relays);
    set({ relays, isLoaded: true });
  },
  resetRelays: () => {
    localStorage.removeItem(RELAYS_STORAGE_KEY);
    set({ relays: [], isLoaded: false });
  },
  updateRelayModal: (show) => set({ showRelayModal: show }),
}));
