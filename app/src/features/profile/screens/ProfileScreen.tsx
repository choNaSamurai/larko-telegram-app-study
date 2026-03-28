import { useProfileQuery } from '../../../api/queries/useProfileQuery';
import { type UserProfile } from '../../../services/ProfileMockData';
import { OptionsCard } from '../components/OptionsCard';
import { User, Building2, ChevronRight } from 'lucide-react';

type ScreenState = 'loading' | 'error' | 'empty' | 'populated';

const deriveScreenState = (isLoading: boolean, isError: boolean, data: UserProfile | undefined | null): ScreenState => {
  if (isError) return 'error';
  if (isLoading) return 'loading';
  if (!data) return 'empty';
  return 'populated';
};

export const ProfileScreen = () => {
  const { data, isLoading, isError } = useProfileQuery();
  const screenState = deriveScreenState(isLoading, isError, data);

  if (screenState === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center h-full min-h-screen">
        <p className="text-status-error font-medium">Помилка завантаження профілю.</p>
      </div>
    );
  }

  // W4_Profile doesn't have an empty state as data should always exist if logged in.
  if (screenState === 'empty') {
    return null;
  }

  const handleCompanyClick = () => {
    // Trigger company switcher overlay
    console.log('Open Company Switcher');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-24 px-0 pt-10 bg-bg-primary">
      {/* Header Profile Info */}
      <div className="flex flex-col items-center mb-10 px-6">
        <div className="w-[88px] h-[88px] rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center mb-5 border-2 border-bg-card shadow-md relative group">
          {screenState === 'loading' ? (
            <div className="w-full h-full bg-white/5 animate-pulse" />
          ) : data?.avatar_url ? (
            <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-content-tertiary" />
          )}
        </div>

        {screenState === 'loading' ? (
          <>
            <div className="w-40 h-7 bg-white/5 animate-pulse rounded-md mb-3" />
            <div className="w-32 h-6 bg-white/5 animate-pulse rounded-full" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-content-primary mb-2 tracking-tight">
              {data?.full_name}
            </h1>
            <button
              type="button"
              onClick={handleCompanyClick}
              className="group flex items-center gap-1.5 px-3 py-1 bg-bg-secondary/80 focus:outline-none hover:bg-white/10 transition-colors rounded-full border border-white/5 active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-status-info" />
              <span className="text-xs font-semibold text-content-secondary group-hover:text-content-primary transition-colors">
                {data?.current_company.name}
              </span>
              <ChevronRight className="w-3 h-3 text-content-tertiary" />
            </button>
          </>
        )}
      </div>

      {/* Options Card */}
      {screenState === 'loading' ? (
        <div className="bg-bg-card rounded-[20px] mx-4 border border-white/5 h-[220px] animate-pulse overflow-hidden shadow-sm">
          <div className="h-1/4 border-b border-white/5" />
          <div className="h-1/4 border-b border-white/5" />
          <div className="h-1/4 border-b border-white/5" />
          <div className="h-1/4" />
        </div>
      ) : (
        <OptionsCard />
      )}
    </div>
  );
};
