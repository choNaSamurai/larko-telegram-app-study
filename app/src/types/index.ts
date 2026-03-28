export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'blocked' | 'checking' | 'dispute';
export type OrderFilter = 'all' | 'new' | 'in_progress' | 'completed';

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  initials: string;
}

export interface Order {
  id: string;
  title: string;
  status: OrderStatus;
  companyId: string;
  companyName: string;
  clientName: string;
  address: string;
  deadline: string;           // ISO 8601 date string
  cost: number;
  currency: string;           // e.g. "₴"
  notes?: string;
  quantityOrHours: number;
  unit: 'qty' | 'hours';
  isOverdue?: boolean;
  assignedWorkersCount?: number;
}

export interface GetOrdersRequest {
  companyId: string;
  filter: OrderFilter;
}

export interface GetOrdersResponse {
  data: Order[];
}
