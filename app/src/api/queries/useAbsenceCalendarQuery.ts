import { useQuery } from '@tanstack/react-query';
import { getAbsenceCalendarMockData, type AbsenceCalendarData } from '../../services/AbsencesMockData';

// Fetch calendar metadata (dots)
export const useAbsenceCalendarQuery = (monthString: string) => {
  return useQuery<AbsenceCalendarData, Error>({
    queryKey: ['absences', 'calendar', monthString],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      return getAbsenceCalendarMockData();
    },
    staleTime: 60000,
  });
};
