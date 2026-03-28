import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface CompanyState {
  activeCompanyId: string | null;
  companies: Company[];
  setActiveCompany: (id: string) => void;
  setCompanies: (companies: Company[]) => void;
}

/**
 * Global store for company context.
 * Traces to Scenario §5 (A2) and ADR Section 2.
 */
export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      companies: [],
      setActiveCompany: (id) => set({ activeCompanyId: id }),
      setCompanies: (companies) => set((state) => ({
        companies,
        activeCompanyId: state.activeCompanyId || (companies.length > 0 ? companies[0].id : null),
      })),
    }),
    {
      name: 'company-storage',
    }
  )
);
