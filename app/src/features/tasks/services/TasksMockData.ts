import type { Task } from '../types';

const subDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    orderNumber: 'O-2024-001',
    productType: 'Сонячна Станція №4',
    clientName: 'ТОВ "СонцеДах"',
    address: 'вул. Київська, 5',
    deadline: addDays(4),
    status: 'IN_PROGRESS',
    notesPreview: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    earnedAmount: 12400,
    workerAvatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2'],
    isUrgent: false,
  },
  {
    id: '2',
    orderNumber: 'O-2024-002',
    productType: 'Ремонт електропроводки',
    clientName: 'ЖБК "Мрія"',
    address: 'пр-т Миру, 12',
    deadline: addDays(1),
    status: 'NEW',
    notesPreview: 'Потрібно замінити автомати в 3-му під’їзді',
    earnedAmount: 4500,
    workerAvatars: ['https://i.pravatar.cc/150?u=3'],
    isUrgent: true,
  },
  {
    id: '3',
    orderNumber: 'O-2023-999',
    productType: 'Аудит лічильників',
    clientName: 'ПриватБанк',
    address: 'вул. Шевченка, 1',
    deadline: subDays(2),
    status: 'DONE',
    notesPreview: 'Провести огляд 12 лічильників у головному офісі',
    earnedAmount: 8200,
    workerAvatars: ['https://i.pravatar.cc/150?u=4'],
    isUrgent: false,
  },
  {
    id: '4',
    orderNumber: 'O-2024-005',
    productType: 'Підключення лічильника',
    clientName: 'ОСББ "Оберіг"',
    address: 'вул. Лісова, 7',
    deadline: subDays(1),
    status: 'BLOCKED',
    notesPreview: 'Відсутній доступ до щитової. Чекаємо ключ.',
    earnedAmount: 1200,
    workerAvatars: ['https://i.pravatar.cc/150?u=1'],
    isUrgent: true,
  }
];
