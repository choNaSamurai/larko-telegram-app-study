import { useQuery } from '@tanstack/react-query';
import { MOCK_USER_PROFILE, type UserProfile } from '../../services/ProfileMockData';

// Simulated API call
const fetchUserProfile = async (): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USER_PROFILE);
    }, 600); // simulate network delay for skeleton loading state
  });
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
};
