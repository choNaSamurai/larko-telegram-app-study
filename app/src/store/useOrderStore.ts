import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderFilter, Company } from '../types';

interface OrderState {
  activeFilter: OrderFilter;
  currentCompany: Company | null;
  companies: Company[];
  
  setFilter: (filter: OrderFilter) => void;
  setCurrentCompany: (company: Company) => void;
  setCompanies: (companies: Company[]) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      activeFilter: 'all',
      currentCompany: null,
      companies: [],
      
      setFilter: (filter) => set({ activeFilter: filter }),
      setCurrentCompany: (company) => set({ currentCompany: company }),
      setCompanies: (companies) => set({ companies }),
    }),
    {
      name: 'larko-order-storage',
      partialize: (state) => ({ 
        activeFilter: state.activeFilter, 
        currentCompany: state.currentCompany 
      }),
    }
  )
);
