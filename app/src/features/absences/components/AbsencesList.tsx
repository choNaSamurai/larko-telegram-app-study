import React from 'react';
import { type AbsenceRequest } from '../../../services/AbsencesMockData';
import { RequestCard } from './RequestCard';
import { Plus } from 'lucide-react';

interface AbsencesListProps {
  requests: AbsenceRequest[];
  onNewRequest: () => void;
}

export const AbsencesList: React.FC<AbsencesListProps> = ({ requests, onNewRequest }) => {
  if (requests.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-8 text-center px-4 pb-[80px]">
        <span className="text-4xl mb-4">🏖️</span>
        <h3 className="text-lg font-semibold text-content-primary mb-2">Немає заявок на відгул</h3>
        <p className="text-sm text-content-secondary mb-6">
          Потрібен вихідний? Створіть заявку нижче 👇
        </p>
        <button
          onClick={onNewRequest}
          className="bg-accent-primary hover:bg-accent-secondary text-white font-semibold py-3 px-6 rounded-full transition-colors active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Створити заявку
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-[100px] relative">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider opacity-80">Мої заявки</h3>
        <button
          onClick={onNewRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary font-semibold text-xs transition-colors hover:bg-accent-primary/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Нова
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 relative z-0">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
        {/* If list overflows, we can simulate fade gradient here if needed, 
            but standard Tailwind overflow scroll handled by parent layout is preferred initially. */}
      </div>
    </div>
  );
};
