import type { Order, Company } from '../types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'ТОВ "СонцеДах"',
    initials: 'СД',
  },
  {
    id: '2',
    name: 'Віконна Лінія',
    initials: 'ВЛ',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    title: 'Сонячна Станція №4',
    status: 'new',
    companyId: '1',
    companyName: 'ТОВ "СонцеДах"',
    clientName: 'Клиент А',
    address: 'вул. Київська, 5',
    deadline: '2026-03-25',
    cost: 12400,
    currency: '₴',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    quantityOrHours: 1,
    unit: 'qty',
    assignedWorkersCount: 3,
  },
  {
    id: '2',
    title: 'Ремонт електропроводки',
    status: 'in_progress',
    companyId: '1',
    companyName: 'ТОВ "СонцеДах"',
    clientName: 'Клиент Б',
    address: 'вул. Київська, 5',
    deadline: '2026-03-22',
    cost: 12400,
    currency: '₴',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    quantityOrHours: 8,
    unit: 'hours',
    isOverdue: true,
  },
  {
    id: '3',
    title: 'Підключення лічильника',
    status: 'checking',
    companyId: '1',
    companyName: 'ТОВ "СонцеДах"',
    clientName: 'Клиент В',
    address: 'вул. Київська, 5',
    deadline: '2026-03-20',
    cost: 12400,
    currency: '₴',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    quantityOrHours: 1,
    unit: 'qty',
  },
];
