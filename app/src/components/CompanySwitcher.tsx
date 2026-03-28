import { useOrderStore } from '../store/useOrderStore';
import { MOCK_COMPANIES } from '../services/mockData';
import { cn } from '../utils/cn';
import { Check, Plus } from 'lucide-react';

interface CompanySwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySwitcher({ isOpen, onClose }: CompanySwitcherProps) {
  const { currentCompany, setCurrentCompany } = useOrderStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-[2.5px] p-4 transition-all duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-[420px] bg-bg-card rounded-t-[24px] shadow-2xl p-6 flex flex-col gap-5 animate-slide-up border-t border-white/10 no-scrollbar overflow-y-auto max-h-[80vh]">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
        
        <h2 className="text-[20px] font-semibold text-content-primary tracking-tight">
          Змінити компанію
        </h2>

        <div className="flex flex-col gap-3">
          {MOCK_COMPANIES.map((company) => {
            const isActive = currentCompany?.id === company.id;
            
            return (
              <button
                key={company.id}
                onClick={() => {
                  setCurrentCompany(company);
                  onClose();
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all border",
                  isActive 
                    ? "bg-bg-primary border-white/20" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center font-bold text-lg",
                    isActive 
                      ? "bg-status-info/20 text-status-info border border-status-info/30" 
                      : "bg-white text-bg-primary"
                  )}>
                    {company.initials}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-medium text-content-primary">
                      {company.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="size-1.5 rounded-full bg-status-success" />
                        <span className="text-status-success text-sm">Активна</span>
                      </div>
                    )}
                  </div>
                </div>
                {isActive && <Check size={20} className="text-white" />}
              </button>
            );
          })}
        </div>

        <button className="w-full h-[56px] rounded-[32px] bg-white text-bg-primary font-semibold text-base flex items-center justify-center gap-2 mt-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-button">
          <Plus size={20} />
          Створити нову компанію
        </button>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
      <div className="size-24 bg-white/5 rounded-full flex items-center justify-center text-4xl">
        🎉
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-content-primary">Немає активних завдань</h3>
        <p className="text-content-secondary max-w-[240px]">
          Всі замовлення виконані або ще не призначені. Насолоджуйтесь відпочинком!
        </p>
      </div>
    </div>
  );
}
