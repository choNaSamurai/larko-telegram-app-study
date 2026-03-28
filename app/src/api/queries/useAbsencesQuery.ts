import { useQuery } from '@tanstack/react-query';
import { mockAbsences, type AbsenceRequest } from '../../services/AbsencesMockData';

// Fetch absence requests (list)
export const useAbsencesQuery = () => {
  return useQuery<AbsenceRequest[], Error>({
    queryKey: ['absences', 'list'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockAbsences;
    },
    staleTime: 60000,
  });
};
