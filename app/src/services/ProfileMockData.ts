export interface UserCompany {
  id: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  telegram_id: string;
  current_company: UserCompany;
}

export const MOCK_USER_PROFILE: UserProfile = {
  id: "user_123",
  full_name: "Павло Мельник",
  avatar_url: null, // Test with null to show initials
  telegram_id: "84729482",
  current_company: {
    id: "comp_1",
    name: "Larko.ai Inc",
    role: "Worker"
  }
};
