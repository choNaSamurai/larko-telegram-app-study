import { useMutation } from '@tanstack/react-query';

interface UpdatePreferencesVariables {
  language?: 'uk' | 'en';
  theme?: 'dark' | 'light';
}

// Simulated API call
const updatePreferences = async (data: UpdatePreferencesVariables): Promise<UpdatePreferencesVariables> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 300);
  });
};

export const useUpdatePreferencesMutation = () => {
  return useMutation({
    mutationFn: updatePreferences,
    onError: (error) => {
      console.error('Failed to patch preferences to backend', error);
      // In a real app we might revert the optimistic UI update here
    }
  });
};
