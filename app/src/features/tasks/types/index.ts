export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

export interface Task {
  id: string;
  orderNumber?: string;
  productType: string;
  clientName: string;
  address: string;
  deadline: string; // ISO8601
  status: TaskStatus;
  notesPreview: string;
  earnedAmount: number;
  workerAvatars: string[];
  isUrgent: boolean;
}

export type TaskFilterType = 'active' | 'completed';
