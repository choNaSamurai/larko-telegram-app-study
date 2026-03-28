import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAbsenceRequestMock, type CreateAbsencePayload, type CreateAbsenceResponse } from '../../services/NewRequestMockData';

// We map generic Axios-like errors here
interface ApiError {
  response?: {
    status: number;
    data?: { error?: string; message?: string };
  };
}

export const useCreateAbsenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAbsenceResponse, ApiError, CreateAbsencePayload>({
    mutationFn: (payload) => createAbsenceRequestMock(payload),
    onSuccess: () => {
      // Invalidate the absences list to refresh W5
      queryClient.invalidateQueries({ queryKey: ['absences'] });
    },
  });
};
