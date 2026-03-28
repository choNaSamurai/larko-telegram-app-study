import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, Check } from 'lucide-react';
import { type AbsenceType } from '../../services/NewRequestMockData';

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  options: AbsenceType[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder = 'Оберіть',
  options,
  value,
  onChange,
  error,
  disabled
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.code === value);

  return (
    <Dialog.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-content-primary">
          {label}
        </label>
        
        <Dialog.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={`flex items-center justify-between w-full h-12 px-4 rounded-xl border text-left cursor-pointer transition-colors
              ${error ? 'border-status-error bg-status-error/5' : 'border-white/10 bg-bg-card hover:bg-white/5'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className={`flex-1 truncate ${!selectedOption ? 'text-content-tertiary' : 'text-content-primary'}`}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            <ChevronDown className="w-5 h-5 text-content-secondary ml-2 flex-shrink-0" />
          </button>
        </Dialog.Trigger>
        
        {error && <p className="text-xs text-status-error">{error}</p>}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-0 right-0 bottom-0 z-50 mt-24 bg-bg-secondary rounded-t-[20px] pb-safe-area shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
          <div className="flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-bg-secondary z-10 rounded-t-[20px]">
              <Dialog.Title className="text-lg font-bold text-content-primary">
                {label}
              </Dialog.Title>
              <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-content-secondary active:scale-95 transition-all outline-none">
                ✕
              </Dialog.Close>
            </div>
            
            <div className="p-2 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onChange(opt.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-95
                    ${value === opt.code ? 'bg-accent-primary/10 text-accent-primary' : 'text-content-primary hover:bg-white/5'}
                  `}
                >
                  <span className="font-medium text-left">{opt.name}</span>
                  {value === opt.code && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
