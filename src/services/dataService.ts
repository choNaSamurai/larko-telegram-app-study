import { supabase } from './supabase';

const IS_DEV = 
  import.meta.env.DEV || 
  import.meta.env.VITE_USE_MOCKS === 'true' || 
  !import.meta.env.VITE_SUPABASE_URL;

interface Profile {
  id: string;
  telegram_id: number;
  full_name: string;
  role: 'admin' | 'worker';
  hourly_rate?: number;
}

interface Order {
  id: string;
  order_number: string;
  name: string;
  product_type_id: string;
  quantity: number;
  deadline: string;
  assigned_worker_id: string;
  status: 'new' | 'in_progress' | 'done';
  created_at: string;
  payment_model?: 'per_unit' | 'per_hour';
  unit_rate?: number;
}

interface ProductType {
  id: string;
  name: string;
  unit_rate: number;
}

interface TimeLog {
  id: string;
  order_id: string;
  startTime: string;
  endTime: string;
  breaks: any[];
  netHours: string;
  created_at: string;
}

interface Advance {
  id: string;
  worker_id: string;
  amount: number;
  description: string;
  created_at: string;
}

const DEFAULT_PROFILES: Profile[] = [];
const DEFAULT_ORDERS: Order[] = [];

// System constants
const STORAGE_KEYS = {
  PROFILES: 'wt_profiles',
  ORDERS: 'wt_orders',
  TIME_LOGS: 'wt_time_logs',
  ADVANCES: 'wt_advances',
  PRODUCT_TYPES: 'wt_product_types',
  SELECTED_ROLE: 'wt_selected_role'
};

const DEFAULT_PRODUCT_TYPES: ProductType[] = [
  { id: '1', name: 'Welding', unit_rate: 150 },
  { id: '2', name: 'Milling', unit_rate: 200 },
  { id: '3', name: 'Assembly', unit_rate: 100 },
];

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));

// Helper for LocalStorage
const getStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
};

const saveStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
  getUserRole: async (telegramId: number, startParam?: string) => {
    await delay(300);
    if (IS_DEV || !supabase) {
      let profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
      
      // Handle Invitations
      if (startParam) {
        if (startParam === 'admin_invite' && !profiles.find(p => p.telegram_id === telegramId && p.role === 'admin')) {
          const newProfile: Profile = { id: `a_${telegramId}_${Date.now()}`, telegram_id: telegramId, full_name: 'Admin User', role: 'admin' };
          profiles = [...profiles, newProfile];
          saveStorage(STORAGE_KEYS.PROFILES, profiles);
        } else if (startParam.startsWith('invite_worker_')) {
          const workerId = startParam.replace('invite_worker_', '');
          // This would normally check if the workerId exists in a pending invitations table
          if (!profiles.find(p => p.telegram_id === telegramId && p.role === 'worker')) {
            const newProfile: Profile = { id: workerId, telegram_id: telegramId, full_name: 'New Worker', role: 'worker', hourly_rate: 150 };
            profiles = [...profiles, newProfile];
            saveStorage(STORAGE_KEYS.PROFILES, profiles);
          }
        }
      }

      const userProfiles = profiles.filter(p => p.telegram_id === telegramId);
      if (userProfiles.length === 0) return { data: null, error: 'No profile found' };

      const selectedRole = localStorage.getItem(STORAGE_KEYS.SELECTED_ROLE) || userProfiles[0].role;
      const currentUser = userProfiles.find(p => p.role === selectedRole) || userProfiles[0];
      
      return { 
        data: { 
          ...currentUser, 
          availableRoles: userProfiles.map(p => p.role) 
        }, 
        error: null 
      };
    }
    return await supabase.from('profiles').select('role, id').eq('telegram_id', telegramId).single();
  },

  registerWorker: async (workerData: { id: string, full_name: string }) => {
    await delay(400);
    if (IS_DEV || !supabase) {
      const profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
      const newProfile: Profile = { 
        id: workerData.id, 
        telegram_id: 0, // Not yet activated
        full_name: workerData.full_name, 
        role: 'worker', 
        hourly_rate: 150 
      };
      saveStorage(STORAGE_KEYS.PROFILES, [...profiles, newProfile]);
      return { data: newProfile, error: null };
    }
    return { data: null, error: 'Not implemented' };
  },

  switchRole: (role: 'admin' | 'worker') => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, role);
    window.location.reload();
  },

  getSelectedRole: () => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_ROLE);
  },

  getOrders: async () => {
    await delay(600);
    if (IS_DEV || !supabase) {
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const productTypes = getStorage<ProductType[]>(STORAGE_KEYS.PRODUCT_TYPES, DEFAULT_PRODUCT_TYPES);
      
      const enrichedOrders = orders.map(order => ({
        ...order,
        type: productTypes.find(pt => pt.id === order.product_type_id)?.name || 'Unknown'
      }));
      
      return { data: enrichedOrders, error: null };
    }
    return await supabase.from('orders').select('*, product_types(name)').order('created_at', { ascending: false });
  },

  createOrder: async (orderData: any) => {
    await delay(800);
    if (IS_DEV || !supabase) {
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const productTypes = getStorage<ProductType[]>(STORAGE_KEYS.PRODUCT_TYPES, DEFAULT_PRODUCT_TYPES);
      const selectedType = productTypes.find(pt => pt.id === orderData.productType);
      
      const newOrder: Order = {
        ...orderData,
        id: crypto.randomUUID(),
        status: 'new',
        created_at: new Date().toISOString(),
        product_type_id: orderData.productType,
        assigned_worker_id: orderData.workerId,
        order_number: orderData.orderNumber,
        name: `${orderData.orderNumber || 'Task'} ${selectedType?.name || ''}`,
        unit_rate: selectedType?.unit_rate || 0,
        payment_model: orderData.paymentModel || 'per_unit'
      };
      const updatedOrders = [newOrder, ...orders];
      saveStorage(STORAGE_KEYS.ORDERS, updatedOrders);
      return { data: newOrder, error: null };
    }
    return await supabase.from('orders').insert(orderData).select().single();
  },

  updateOrderStatus: async (orderId: string, status: 'new' | 'in_progress' | 'done') => {
    await delay(500);
    if (IS_DEV || !supabase) {
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
      saveStorage(STORAGE_KEYS.ORDERS, updatedOrders);
      return { data: { id: orderId, status }, error: null };
    }
    return await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
  },

  getBalance: async (telegramId: number) => {
    await delay(400);
    if (IS_DEV || !supabase) {
      const profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
      const user = profiles.find(p => p.telegram_id === telegramId);
      if (!user) return { data: { earned: 0, advances: 0, remaining: 0 }, error: null };

      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const logs = getStorage<TimeLog[]>(STORAGE_KEYS.TIME_LOGS, []);
      const advances = getStorage<Advance[]>(STORAGE_KEYS.ADVANCES, []);

      // Calculate earned from completed orders (Per Unit)
      const earnedFromUnits = orders
        .filter(o => o.assigned_worker_id === user.id && o.status === 'done' && o.payment_model === 'per_unit')
        .reduce((sum, o) => sum + (o.quantity * (o.unit_rate || 0)), 0);

      // Calculate earned from time logs (Per Hour)
      const earnedFromHours = logs
        .filter(l => {
          const order = orders.find(o => o.id === l.order_id);
          return order?.assigned_worker_id === user.id && order?.payment_model === 'per_hour';
        })
        .reduce((sum, l) => sum + (parseFloat(l.netHours) * (user.hourly_rate || 150)), 0);

      const totalEarned = earnedFromUnits + earnedFromHours;
      const totalAdvances = advances
        .filter(a => a.worker_id === user.id)
        .reduce((sum, a) => sum + a.amount, 0);

      return { 
        data: { 
          earned: totalEarned, 
          advances: totalAdvances, 
          remaining: totalEarned - totalAdvances 
        }, 
        error: null 
      };
    }
    return { data: { earned: 0, advances: 0, remaining: 0 }, error: null };
  },

  getWorkers: async () => {
    await delay(500);
    if (IS_DEV || !supabase) {
      return { data: getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES).filter(p => p.role === 'worker'), error: null };
    }
    return await supabase.from('profiles').select('*').eq('role', 'worker');
  },

  getFinanceStats: async () => {
    await delay(700);
    if (IS_DEV || !supabase) {
      const workers = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES).filter(p => p.role === 'worker');
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const logs = getStorage<TimeLog[]>(STORAGE_KEYS.TIME_LOGS, []);
      const advances = getStorage<Advance[]>(STORAGE_KEYS.ADVANCES, []);

      let totalEarned = 0;
      let totalAdvances = 0;

      workers.forEach(w => {
        const earnedUnits = orders
          .filter(o => o.assigned_worker_id === w.id && o.status === 'done' && o.payment_model === 'per_unit')
          .reduce((sum, o) => sum + (o.quantity * (o.unit_rate || 0)), 0);
        
        const earnedHours = logs
          .filter(l => {
            const order = orders.find(o => o.id === l.order_id);
            return order?.assigned_worker_id === w.id && order?.payment_model === 'per_hour';
          })
          .reduce((sum, l) => sum + (parseFloat(l.netHours) * (w.hourly_rate || 150)), 0);

        totalEarned += (earnedUnits + earnedHours);
        totalAdvances += advances
          .filter(a => a.worker_id === w.id)
          .reduce((sum, a) => sum + a.amount, 0);
      });

      return { 
        data: { 
          total_earned: totalEarned, 
          total_advances: totalAdvances, 
          total_remaining: totalEarned - totalAdvances 
        }, 
        error: null 
      };
    }
    return { data: { total_earned: 0, total_advances: 0, total_remaining: 0 }, error: null };
  },

  getProductTypes: async () => {
    await delay(300);
    if (IS_DEV || !supabase) {
      return { data: getStorage<ProductType[]>(STORAGE_KEYS.PRODUCT_TYPES, DEFAULT_PRODUCT_TYPES), error: null };
    }
    return await supabase.from('product_types').select('*');
  },

  issueAdvance: async (advanceData: { worker_id: string, amount: number, description: string }) => {
    await delay(600);
    if (IS_DEV || !supabase) {
      const advances = getStorage<Advance[]>(STORAGE_KEYS.ADVANCES, []);
      const newAdvance: Advance = {
        ...advanceData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      saveStorage(STORAGE_KEYS.ADVANCES, [...advances, newAdvance]);
      return { data: newAdvance, error: null };
    }
    return await supabase.from('advances').insert(advanceData).select().single();
  },

  getTransactionHistory: async (workerId: string) => {
    await delay(700);
    if (IS_DEV || !supabase) {
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const advances = getStorage<Advance[]>(STORAGE_KEYS.ADVANCES, []);
      
      const orderHistory = orders
        .filter(o => o.assigned_worker_id === workerId && o.status === 'done')
        .map(o => ({
          id: o.id,
          timestamp: o.created_at,
          narrative: `Order ${o.order_number}`,
          subtext: o.name,
          impact: o.quantity * (o.unit_rate || 0),
          type: 'income'
        }));

      const advanceHistory = advances
        .filter(a => a.worker_id === workerId)
        .map(a => ({
          id: a.id,
          timestamp: a.created_at,
          narrative: 'Advance Payout',
          subtext: a.description,
          impact: -a.amount,
          type: 'payout'
        }));

      const history = [...orderHistory, ...advanceHistory].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return { data: history, error: null };
    }
    // Simplification for Supabase (would need a complex union or separate calls)
    return { data: [], error: null };
  },

  submitTimeLog: async (logData: any) => {
    await delay(800);
    if (IS_DEV || !supabase) {
      const logs = getStorage<TimeLog[]>(STORAGE_KEYS.TIME_LOGS, []);
      const newLog: TimeLog = { ...logData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      const updatedLogs = [...logs, newLog];
      saveStorage(STORAGE_KEYS.TIME_LOGS, updatedLogs);
      
      // Auto-transition order to 'in_progress' if it was 'new'
      const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const order = orders.find(o => o.id === logData.order_id);
      if (order && order.status === 'new') {
        const updatedOrders = orders.map(o => o.id === order.id ? { ...o, status: 'in_progress' } : o as Order);
        saveStorage(STORAGE_KEYS.ORDERS, updatedOrders);
      }

      return { data: newLog, error: null };
    }
    return await supabase.from('time_logs').insert(logData).select().single();
  }
};
