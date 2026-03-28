import React, { useState } from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysWithAbsences: string[]; // 'yyyy-MM-dd' format
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  daysWithAbsences,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(selectedDate));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  // Get days including padding from prev and next month to complete the 7-day rows
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  return (
    <div className="bg-bg-card rounded-[20px] p-4 border border-white/5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors text-content-secondary active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-sm font-semibold capitalize text-content-primary tracking-wide">
          {format(currentMonth, 'LLLL yyyy', { locale: uk })}
        </p>
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors text-content-secondary active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* WeekDays Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-content-tertiary">
            {label}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {daysInGrid.map((day, idx) => {
          const formattedDay = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasAbsence = daysWithAbsences.includes(formattedDay);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString() + idx}
              onClick={() => onSelectDate(day)}
              className="relative aspect-square flex items-center justify-center p-1"
            >
              <div
                className={`w-full h-full flex items-center justify-center rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-status-info text-white font-bold'
                    : isTodayDate
                    ? 'text-status-info font-bold bg-status-info/10'
                    : isCurrentMonth
                    ? 'text-content-primary font-medium hover:bg-bg-secondary'
                    : 'text-content-tertiary hover:bg-bg-secondary/50'
                }`}
              >
                {format(day, 'd')}
              </div>
              {hasAbsence && (
                <div 
                  className={`absolute bottom-0 w-1 h-1 rounded flex shrink-0 ${
                    isSelected ? 'bg-white' : 'bg-status-warning'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
