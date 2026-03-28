import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { useAbsencesQuery } from '../../../api/queries/useAbsencesQuery';
import { useAbsenceCalendarQuery } from '../../../api/queries/useAbsenceCalendarQuery';
import { MiniCalendar } from '../components/MiniCalendar';
import { AbsencesList } from '../components/AbsencesList';
import { type AbsenceRequest } from '../../../services/AbsencesMockData';

type ScreenState = 'loading' | 'error' | 'empty' | 'populated';

const deriveScreenState = (
  isLoading: boolean,
  isError: boolean,
  data: AbsenceRequest[] | undefined | null
): ScreenState => {
  if (isError) return 'error';
  if (isLoading) return 'loading';
  if (!data || data.length === 0) return 'empty';
  return 'populated';
};

interface AbsencesScreenProps {
  onBack: () => void;
  onNavigateToNewRequest: () => void;
}

export const AbsencesScreen: React.FC<AbsencesScreenProps> = ({ onBack, onNavigateToNewRequest }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // We use current year-month of the selected date for fetching dots.
  // Real implementation might separate mini-calendar's viewed month from selectedDate.
  const calendarMonthKey = format(selectedDate, 'yyyy-MM');

  const { data: requests, isLoading: isLoadingRequests, isError: isReqError } = useAbsencesQuery();
  const { data: calendarData, isLoading: isLoadingCalendar, isError: isCalError } = useAbsenceCalendarQuery(calendarMonthKey);

  const screenState = deriveScreenState(
    isLoadingRequests || isLoadingCalendar, // Wait for both
    isReqError || isCalError,
    requests
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary overflow-y-auto w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center px-4 h-14 bg-bg-primary/90 backdrop-blur-md border-b border-white/5 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-secondary text-content-secondary transition-colors active:scale-95 -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-content-primary flex-1 text-center pr-8 tracking-tight">
          Вихідні та відпустки
        </h1>
      </div>

      <div className="flex-1 flex flex-col pt-6 overflow-x-hidden">
        {screenState === 'error' && (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-status-error mb-2">Помилка завантаження</h2>
            <p className="text-sm text-content-secondary mb-6 leading-relaxed">
              Не вдалося завантажити заявки. Перевірте інтернет-з'єднання та спробуйте ще раз.
            </p>
            <button
              onClick={() => window.location.reload()} // Mock reload for now, or retry query
              className="px-6 py-2.5 bg-bg-secondary text-content-primary rounded-full hover:bg-white/10 font-bold active:scale-95 transition-all outline-none"
            >
              Спробувати знову
            </button>
          </div>
        )}

        {screenState === 'loading' && (
          <div className="px-4 flex flex-col gap-6 w-full max-w-md mx-auto">
            {/* Calendar Skeleton */}
            <div className="w-full h-[280px] rounded-[20px] bg-bg-card animate-pulse border border-white/5" />
            
            {/* List Skeleton Header */}
            <div className="flex justify-between items-center mb-[-8px]">
              <div className="w-24 h-5 bg-bg-card animate-pulse rounded" />
              <div className="w-16 h-8 bg-bg-card animate-pulse rounded-full" />
            </div>

            {/* List Skeletons */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-24 rounded-[16px] bg-bg-card animate-pulse border border-white/5 flex flex-col p-4 gap-3">
                <div className="flex justify-between">
                   <div className="w-1/3 h-5 bg-white/5 rounded" />
                   <div className="w-1/4 h-5 bg-white/5 rounded-full" />
                </div>
                <div className="w-1/2 h-4 bg-white/5 rounded" />
                <div className="w-2/3 h-4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {screenState === 'empty' && (
          // Calendar is NOT shown for empty-ever state.
          <AbsencesList
            requests={[]}
            onNewRequest={onNavigateToNewRequest}
          />
        )}

        {screenState === 'populated' && requests && calendarData && (
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            {/* Mini Calendar Section */}
            <div className="px-4">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                daysWithAbsences={calendarData.days_with_absences}
              />
            </div>

            {/* Requests List Section */}
            <AbsencesList
              requests={requests} // We would pass filtered ones if cell tap filters them, but ADR says scrolls/highlights. For now, passing all.
              onNewRequest={onNavigateToNewRequest}
            />
          </div>
        )}
      </div>
    </div>
  );
};
