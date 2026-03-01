import { create } from "zustand";
import { setItem } from "../common/localStorage";
import { signerManager } from "../common/signer";
import { useTimeBasedEvents } from "./events";
import { cancelAllNotifications } from "../utils/notifications";

export interface IUser {
  name?: string;
  picture?: string;
  pubkey: string;
  privateKey?: string;
  follows?: string[];
  webOfTrust?: Set<string>;
  about?: string;
}

let isInitializing = false;

const USER_STORAGE_KEY = "nostr_user";

export const useUser = create<{
  user: IUser | null;
  isInitialized: boolean;
  showLoginModal: boolean;
  updateLoginModal: (show: boolean) => void;
  updateUser: (user: IUser) => void;
  logout: () => void;
  initializeUser: () => Promise<void>;
}>((set) => ({
  showLoginModal: false,
  updateLoginModal: (show) => {
    set({ showLoginModal: show });
  },
  user: null,
  isInitialized: false,

  updateUser: (user) => {
    set({ user });
    setItem(USER_STORAGE_KEY, user);
  },
  logout: () => {
    signerManager.logout();
    cancelAllNotifications();
    set({ user: null });
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  initializeUser: async () => {
    if (!isInitializing) {
      isInitializing = true;
      signerManager.onChange(onUserChange);
      signerManager.restoreFromStorage();
    }
  },
}));

const onUserChange = async () => {
  const currentUser = useUser.getState().user;
  const cachedUser = signerManager.getUser();

  if (cachedUser) {
    useUser.setState({
      isInitialized: true,
      user: cachedUser,
    });
    if (currentUser?.pubkey !== cachedUser.pubkey) {
      const eventManager = useTimeBasedEvents.getState();
      eventManager.resetPrivateEvents();
    }
  } else {
    useUser.setState({
      isInitialized: true,
      user: null,
    });
    if (currentUser?.pubkey !== undefined) {
      const eventManager = useTimeBasedEvents.getState();
      eventManager.resetPrivateEvents();
    }
  }
};
