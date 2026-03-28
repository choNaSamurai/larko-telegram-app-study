import { useQuery } from '@tanstack/react-query';
import { MOCK_ORDERS } from '../services/mockData';
import { useOrderStore } from '../store/useOrderStore';
import type { Order, OrderFilter } from '../types';

const fetchOrders = async (companyId: string | null, filter: OrderFilter): Promise<Order[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  if (!companyId) return [];
  
  let orders = MOCK_ORDERS.filter((order) => order.companyId === companyId);
  
  if (filter !== 'all') {
    orders = orders.filter((order) => {
      if (filter === 'new') return order.status === 'new';
      if (filter === 'in_progress') return order.status === 'in_progress';
      if (filter === 'completed') return order.status === 'completed';
      return true;
    });
  }
  
  return orders;
};

export const useOrders = () => {
  const { currentCompany, activeFilter } = useOrderStore();
  
  return useQuery({
    queryKey: ['orders', currentCompany?.id, activeFilter],
    queryFn: () => fetchOrders(currentCompany?.id ?? null, activeFilter),
    enabled: !!currentCompany?.id,
  });
};
