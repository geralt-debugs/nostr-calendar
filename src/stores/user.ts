import { create } from "zustand";
import { setItem } from "../common/localStorage";
import { signerManager } from "../common/signer";
import { useTimeBasedEvents } from "./events";

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
    set({ user: null });
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  initializeUser: async () => {
    if (!isInitializing) {
      isInitializing = true;
      setTimeout(() => {
        signerManager.onChange(onUserChange);
        signerManager.restoreFromStorage();
      }, 500);
    }
  },
}));

const onUserChange = async () => {
  let hasUserChanged = false;
  const currentUser = useUser.getState().user;
  try {
    const signer = await signerManager.getSigner();
    const user = await signer.getPublicKey();
    useUser.setState({
      isInitialized: true,
      user: {
        pubkey: user,
      },
    });
    hasUserChanged = currentUser?.pubkey !== user;
  } catch (e) {
    if (e.message === "NO_SIGNER_AVAILABLE_AND_NO_LOGIN_REQUEST_REGISTERED") {
      useUser.setState({
        isInitialized: true,
        user: null,
      });
      hasUserChanged = currentUser?.pubkey !== null;
    }
    throw e;
  }
  if (hasUserChanged) {
    const eventManager = useTimeBasedEvents.getState();
    eventManager.resetPrivateEvents();
  }
};
