import type { Task } from '../types';

/**
 * Mock data for development and testing.
 * Traces to Scenario §11 and BRD 2.0.153.
 * File location specified in Tech Stack §4.
 */

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    orderNumber: 'ORD-1234',
    productName: 'iPhone 15 Pro Max',
    serviceType: 'Repair',
    clientName: 'John Doe',
    quantity: 1,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'IN_PROGRESS',
  },
  {
    id: '2',
    orderNumber: 'ORD-1235',
    productName: 'Samsung S24 Ultra',
    serviceType: 'Diagnosis',
    clientName: 'Jane Smith',
    quantity: 2,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow (should be highlighted)
    status: 'NEW',
  },
  {
    id: '3',
    orderNumber: 'ORD-1236',
    productName: 'MacBook Air M3',
    serviceType: 'Cleaning',
    clientName: 'Company Co.',
    quantity: 1,
    deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday (overdue)
    status: 'IN_REVIEW',
  },
  {
    id: '4',
    orderNumber: 'ORD-1230',
    productName: 'iPad Pro',
    serviceType: 'Repair',
    quantity: 1,
    deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'DONE',
  }
];

export const getMockTasks = (filter: 'active' | 'completed'): Task[] => {
  if (filter === 'completed') {
    return MOCK_TASKS.filter(task => task.status === 'DONE');
  }
  return MOCK_TASKS.filter(task => task.status !== 'DONE');
};
