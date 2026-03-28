import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css'; // Requires the default CSS or custom tailwind equivalent

interface DatePickerFieldProps {
  label: string;
  placeholder?: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  placeholder = 'Оберіть дату',
  value,
  onChange,
  error,
  disabled,
  minDate,
}) => {
  const [open, setOpen] = React.useState(false);

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
            <span className={`flex-1 truncate ${!value ? 'text-content-tertiary' : 'text-content-primary'}`}>
              {value ? format(value, 'dd.MM.yyyy') : placeholder}
            </span>
            <CalendarIcon className="w-5 h-5 text-content-secondary ml-2 flex-shrink-0" />
          </button>
        </Dialog.Trigger>
        
        {error && <p className="text-xs text-status-error">{error}</p>}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-0 right-0 bottom-0 z-50 bg-bg-secondary rounded-t-[20px] pb-safe-area shadow-xl outline-none flex flex-col items-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
          <div className="flex items-center justify-between p-4 border-b border-white/10 w-full sticky top-0 bg-bg-secondary z-10 rounded-t-[20px]">
             <Dialog.Title className="text-lg font-bold text-content-primary truncate max-w-[80%]">
               {label}
             </Dialog.Title>
             <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-content-secondary active:scale-95 transition-all outline-none">
               ✕
             </Dialog.Close>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[70vh] w-full flex justify-center date-picker-glass">
            <style dangerouslySetInnerHTML={{ __html: `
              .date-picker-glass .rdp {
                --rdp-cell-size: 40px;
                --rdp-accent-color: #2D60FF;
                --rdp-background-color: rgba(255, 255, 255, 0.1);
                /* Customize day picker for dark mode glassmorphism */
                color: #ffffff;
                margin: 0;
              }
              .date-picker-glass .rdp-day_selected {
                background-color: var(--rdp-accent-color) !important;
                color: white;
                font-weight: bold;
              }
              .date-picker-glass .rdp-day:hover:not(.rdp-day_outside) {
                background-color: var(--rdp-background-color);
              }
              .date-picker-glass .rdp-button:focus-visible:not([disabled]) {
                outline: 2px solid var(--rdp-accent-color);
              }
            `}} />
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => {
                if (date) {
                  onChange(date);
                  setOpen(false);
                }
              }}
              disabled={minDate ? [{ before: minDate }] : undefined}
              showOutsideDays
              className="bg-transparent"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
