import { useQuery } from '@tanstack/react-query';
import { fetchAbsenceTypesMock, type AbsenceType } from '../../services/NewRequestMockData';

export const useAbsenceTypesQuery = () => {
  return useQuery<AbsenceType[], Error>({
    queryKey: ['absenceTypes'],
    queryFn: fetchAbsenceTypesMock,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours as per Tech Stack
  });
};
