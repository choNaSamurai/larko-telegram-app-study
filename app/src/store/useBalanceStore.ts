// W3 My Balance — Zustand store
// Tech Stack § Phase 3 — Zustand Store
import { create } from 'zustand';

interface BalanceStore {
  isInfoPopupOpen: boolean;
  openInfoPopup: () => void;
  closeInfoPopup: () => void;
}

export const useBalanceStore = create<BalanceStore>()((set) => ({
  isInfoPopupOpen: false,
  openInfoPopup: () => set({ isInfoPopupOpen: true }),
  closeInfoPopup: () => set({ isInfoPopupOpen: false }),
}));
