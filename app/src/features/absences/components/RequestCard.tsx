import React from 'react';
import { type AbsenceRequest, type AbsenceType, type AbsenceStatus } from '../../../services/AbsencesMockData';
import { differenceInDays, parseISO, format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface RequestCardProps {
  request: AbsenceRequest;
}

const getTypeLabel = (type: AbsenceType): string => {
  const map: Record<AbsenceType, string> = {
    vacation: 'Відпустка',
    sick_leave: 'Лікарняний',
    personal_day: 'Особистий день',
    holiday: 'Вихідний',
    unpaid_leave: 'Без збереження',
    family_leave: 'Сімейний',
    training: 'Навчання',
    other: 'Інше',
  };
  return map[type];
};

const getStatusDisplay = (status: AbsenceStatus) => {
  switch (status) {
    case 'approved':
      return { label: 'Затверджено', colorClass: 'text-status-success bg-status-success/10' };
    case 'rejected':
      return { label: 'Відхилено', colorClass: 'text-status-error bg-status-error/10' };
    case 'pending':
    default:
      return { label: 'На розгляді', colorClass: 'text-status-warning bg-status-warning/10' };
  }
};

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const statusDisplay = getStatusDisplay(request.status);
  
  // Parse dates
  const startDate = parseISO(request.start_date);
  const endDate = parseISO(request.end_date);
  // inclusive difference
  const days = differenceInDays(endDate, startDate) + 1;
  
  // Format range: "10-11 березня"
  const startMonth = format(startDate, 'LLLL', { locale: uk });
  const endMonth = format(endDate, 'LLLL', { locale: uk });
  
  let dateRangeStr = '';
  if (startMonth === endMonth) {
    if (days === 1) {
      dateRangeStr = `${format(startDate, 'd MMMM', { locale: uk })}`;
    } else {
      dateRangeStr = `${format(startDate, 'd')}–${format(endDate, 'd')} ${format(startDate, 'MMMM', { locale: uk })}`;
    }
  } else {
    dateRangeStr = `${format(startDate, 'd MMM', { locale: uk })} – ${format(endDate, 'd MMM', { locale: uk })}`;
  }
  
  // Handle inflections for days
  const getDaysLabel = (d: number) => {
    const mod10 = d % 10;
    const mod100 = d % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'днів';
    if (mod10 === 1) return 'день';
    if (mod10 >= 2 && mod10 <= 4) return 'дні';
    return 'днів';
  };

  return (
    <div className="bg-bg-card rounded-[16px] p-4 border border-white/5 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-content-primary">
          {getTypeLabel(request.type)}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusDisplay.colorClass}`}>
          {statusDisplay.label}
        </span>
      </div>
      
      <p className="text-xs text-content-secondary font-medium">
        {dateRangeStr} · {days} {getDaysLabel(days)}
      </p>
      
      {request.reason && (
        <p className="text-xs text-content-tertiary mt-1">
          {request.reason}
        </p>
      )}
      
      {request.status === 'rejected' && request.review_comment && (
        <p className="text-xs text-status-error/80 mt-1 italic">
          Примітка: {request.review_comment}
        </p>
      )}
    </div>
  );
};
