import { supabase } from './supabase';

const IS_DEV = import.meta.env.DEV || !import.meta.env.VITE_SUPABASE_URL;

// Mock Data
const MOCK_PROFILES = [
  { telegram_id: 12345678, full_name: 'Admin User', role: 'admin' },
  { telegram_id: 87654321, full_name: 'Worker Ivan', role: 'worker' },
];

const MOCK_ORDERS = [
  { id: '1', name: '#1024 Metal Brackets', type: 'Welding', qty: 50, deadline: '2026-03-25', status: 'In Progress' },
  { id: '2', name: '#1025 Door Handles', type: 'Milling', qty: 200, deadline: '2026-03-22', status: 'New' },
];

const MOCK_BALANCE = {
  earned: 15400,
  advances: 5000,
  remaining: 10400,
};

const MOCK_WORKERS = [
  { id: 'w1', telegram_id: 87654321, full_name: 'Ivan S.', role: 'worker', active_orders: 2, hourly_rate: 150 },
  { id: 'w2', telegram_id: 11223344, full_name: 'Petro K.', role: 'worker', active_orders: 1, hourly_rate: 140 },
];

const MOCK_FINANCE = {
  total_earned: 95000,
  total_advances: 32000,
  total_remaining: 63000,
};

export const dataService = {
  getUserRole: async (telegramId: number) => {
    if (IS_DEV) {
      const user = MOCK_PROFILES.find(p => p.telegram_id === telegramId);
      return { data: user || { role: 'admin' }, error: null };
    }
    return await supabase.from('profiles').select('role').eq('telegram_id', telegramId).single();
  },

  getOrders: async () => {
    if (IS_DEV) return { data: MOCK_ORDERS, error: null };
    return await supabase.from('orders').select('*').order('created_at', { ascending: false });
  },

  getBalance: async (_telegramId: number) => {
    if (IS_DEV) return { data: MOCK_BALANCE, error: null };
    // Real Supabase logic would aggregate orders/hours and subtract advances
    return { data: MOCK_BALANCE, error: null };
  },

  getWorkers: async () => {
    if (IS_DEV) return { data: MOCK_WORKERS, error: null };
    return await supabase.from('profiles').select('*').eq('role', 'worker');
  },

  getFinanceStats: async () => {
    if (IS_DEV) return { data: MOCK_FINANCE, error: null };
    return { data: MOCK_FINANCE, error: null };
  },

  getProductTypes: async () => {
    const mockTypes = [
      { id: '1', name: 'Welding', unit_rate: 150 },
      { id: '2', name: 'Milling', unit_rate: 200 },
      { id: '3', name: 'Assembly', unit_rate: 100 },
    ];
    return { data: mockTypes, error: null };
  }
};
