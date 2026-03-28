import { addDays, format, subDays } from 'date-fns';

export type AbsenceStatus = 'pending' | 'approved' | 'rejected';
export type AbsenceType = 'vacation' | 'sick_leave' | 'personal_day' | 'holiday' | 'unpaid_leave' | 'family_leave' | 'training' | 'other';

export interface AbsenceRequest {
  id: string;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  reason?: string;
  status: AbsenceStatus;
  review_comment?: string;
}

export interface AbsenceCalendarData {
  days_with_absences: string[];
}

const today = new Date();

// Mock data generating some relative dates based on current date
export const mockAbsences: AbsenceRequest[] = [
  {
    id: 'req_1',
    type: 'vacation',
    start_date: format(addDays(today, 5), 'yyyy-MM-dd'),
    end_date: format(addDays(today, 8), 'yyyy-MM-dd'),
    reason: 'Planned vacation in the mountains',
    status: 'approved',
  },
  {
    id: 'req_2',
    type: 'sick_leave',
    start_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    end_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    reason: 'Felt sick, took a day off',
    status: 'rejected',
    review_comment: 'Not enough prior notice, please read policy.',
  },
  {
    id: 'req_3',
    type: 'personal_day',
    start_date: format(addDays(today, 15), 'yyyy-MM-dd'),
    end_date: format(addDays(today, 15), 'yyyy-MM-dd'),
    status: 'pending',
  },
];

// Helper to calculate days spanning
function getDaysSpanning(req: AbsenceRequest): string[] {
  const days: string[] = [];
  let current = new Date(req.start_date);
  const end = new Date(req.end_date);
  while (current <= end) {
    days.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }
  return days;
}

// Generate the dots dynamically from mockAbsences
export const getAbsenceCalendarMockData = (): AbsenceCalendarData => {
  // We'll just return all days spanning for simplicity in the mock
  const days_with_absences = Array.from(new Set(mockAbsences.flatMap(getDaysSpanning)));
  return {
    days_with_absences,
  };
};
