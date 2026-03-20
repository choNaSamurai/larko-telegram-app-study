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

export const dataService = {
  getUserRole: async (telegramId: number) => {
    if (IS_DEV) {
      const user = MOCK_PROFILES.find(p => p.telegram_id === telegramId);
      return { data: user || { role: 'admin' }, error: null };
    }

    return await supabase
      .from('profiles')
      .select('role')
      .eq('telegram_id', telegramId)
      .single();
  },

  getOrders: async () => {
    if (IS_DEV) {
      return { data: MOCK_ORDERS, error: null };
    }

    return await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
  },

  // Add more methods as needed...
};
