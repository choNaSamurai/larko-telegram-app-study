export interface AbsenceType {
  id: string;
  name: string;
  code: string;
}

export const mockAbsenceTypes: AbsenceType[] = [
  { id: '1', name: 'Відпустка', code: 'vacation' },
  { id: '2', name: 'Лікарняний', code: 'sick_leave' },
  { id: '3', name: 'Відгул', code: 'personal_day' },
  { id: '4', name: 'Свято', code: 'holiday' },
  { id: '5', name: 'Відпустка за власний рахунок', code: 'unpaid_leave' },
  { id: '6', name: 'За сімейними обставинами', code: 'family_leave' },
  { id: '7', name: 'Навчання', code: 'training' },
  { id: '8', name: 'Інше', code: 'other' },
];

export interface CreateAbsencePayload {
  company_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface CreateAbsenceResponse {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending';
  created_at: string;
}

export const createAbsenceRequestMock = async (payload: CreateAbsencePayload): Promise<CreateAbsenceResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 409 Overlap Conflict randomly for testing (e.g. 10% chance), but let's avoid randomness to ensure predictable flow.
      // If the user types 'conflict' in reason we simulate it:
      if (payload.reason?.toLowerCase().includes('conflict')) {
        reject({
          response: {
            status: 409,
            data: { error: 'OVERLAP_CONFLICT', message: 'У вас вже є схвалена заявка на цей період' }
          }
        });
        return;
      }
      
      resolve({
        id: `req_${Math.random().toString(36).substr(2, 9)}`,
        ...payload,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }, 1500); // 1.5s delay to show loading state
  });
};

export const fetchAbsenceTypesMock = async (): Promise<AbsenceType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAbsenceTypes);
    }, 500);
  });
};
