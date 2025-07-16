import { create } from "zustand";

export interface IUser {
  publicKey: string;
}

export const useUser = create<{
  user: IUser | null;
  updateUser: (user: IUser) => void;
  logout: () => void;
}>((set) => ({
  user: null,
  updateUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
