import { create } from "zustand";
import { getItem, setItem } from "../common/localStorage";

export interface IUser {
  publicKey: string;
}

const USER_STORAGE_KEY = "nostr_user";

export const useUser = create<{
  user: IUser | null;
  isInitialized: boolean;
  updateUser: (user: IUser) => void;
  logout: () => void;
  initializeUser: () => void;
}>((set) => ({
  user: null,
  isInitialized: false,
  
  updateUser: (user) => {
    set({ user });
    setItem(USER_STORAGE_KEY, user);
  },
  
  logout: () => {
    set({ user: null });
    localStorage.removeItem(USER_STORAGE_KEY);
  },
  
  initializeUser: () => {
    const storedUser = getItem<IUser | null>(USER_STORAGE_KEY, null);
    set({ 
      user: storedUser,
      isInitialized: true
    });
  },
}));