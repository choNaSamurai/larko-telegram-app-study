import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Calendar as CalendarIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

import { absenceRequestSchema, type AbsenceFormValues } from '../schema/absenceRequestSchema';
import { useCreateAbsenceMutation } from '../../../api/mutations/useCreateAbsenceMutation';
import { useAbsenceTypesQuery } from '../../../api/queries/useAbsenceTypesQuery';
import { SelectField } from '../../../components/forms/SelectField';
import { DatePickerField } from '../../../components/forms/DatePickerField';

type ScreenState = 'default' | 'filled' | 'submitting' | 'success' | 'error';

const deriveScreenState = (
  isSubmitting: boolean,
  isSuccess: boolean,
  hasValidationErrors: boolean,
  isValid: boolean,
  hasApiError: boolean
): ScreenState => {
  if (isSubmitting) return 'submitting';
  if (isSuccess) return 'success';
  if (hasApiError || hasValidationErrors) return 'error';
  if (isValid) return 'filled';
  return 'default';
};

const getDaysDeclension = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дні';
  return 'днів';
};

interface NewRequestScreenProps {
  onBack: () => void;
  companyId: string;
}

export const NewRequestScreen: React.FC<NewRequestScreenProps> = ({ onBack, companyId }) => {
  const { data: absenceTypes = [], isLoading: isLoadingTypes } = useAbsenceTypesQuery();
  const { mutateAsync: createAbsence, isPending, isSuccess, error: apiError } = useCreateAbsenceMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceRequestSchema),
    mode: 'onChange',
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const durationDays = (startDate && endDate && endDate >= startDate)
    ? differenceInCalendarDays(endDate, startDate) + 1
    : null;

  const hasValidationErrors = Object.keys(errors).length > 0;
  const hasApiError = !!apiError;
  
  const screenState = deriveScreenState(
    isPending,
    isSuccess,
    hasValidationErrors,
    isValid,
    hasApiError
  );

  const isReadOnly = screenState === 'success' || screenState === 'submitting';

  const onSubmit = async (data: AbsenceFormValues) => {
    if (!navigator.onLine) {
      alert("Немає підключення до мережі. Офлайн подача не підтримується.");
      return;
    }
    
    try {
      await createAbsence({
        company_id: companyId,
        type: data.type,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        reason: data.reason
      });
    } catch {
      // Error is handled by mutation state
    }
  };

  const getApiErrorMessage = () => {
    if (apiError?.response?.status === 409) {
      return apiError.response.data?.message || 'У вас вже є схвалена заявка на цей період';
    }
    return 'Сталася помилка при надсиланні. Спробуйте ще раз.';
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary overflow-y-auto w-full relative pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center px-4 h-14 bg-bg-primary/90 backdrop-blur-md border-b border-white/5 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-secondary text-content-secondary transition-colors active:scale-95 -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-content-primary flex-1 text-center pr-8 tracking-tight">
          Нова заявка
        </h1>
      </div>

      <div className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto pt-6 gap-6">
        <form id="absence-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Тип відсутності"
                options={absenceTypes}
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.type?.message}
                disabled={isReadOnly || isLoadingTypes}
              />
            )}
          />

          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <DatePickerField
                label="Дата початку"
                value={field.value}
                onChange={field.onChange}
                error={errors.start_date?.message}
                disabled={isReadOnly}
                minDate={new Date()} // Can't select past date natively in UI
              />
            )}
          />

          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <DatePickerField
                label="Дата закінчення"
                value={field.value}
                onChange={field.onChange}
                error={errors.end_date?.message}
                disabled={isReadOnly}
                minDate={startDate || new Date()} 
              />
            )}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-content-primary">
              {screenState === 'success' ? 'Причина' : 'Причина (необов\'язково)'}
            </label>
            <textarea
              {...control.register('reason')}
              disabled={isReadOnly}
              placeholder="Опишіть причину..."
              className={`w-full h-24 p-4 rounded-xl border text-content-primary bg-bg-card transition-colors resize-none placeholder:text-content-tertiary
                ${errors.reason ? 'border-status-error bg-status-error/5' : 'border-white/10 hover:bg-white/5 focus:border-accent-primary outline-none'}
                ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            {errors.reason && <p className="text-xs text-status-error">{errors.reason.message}</p>}
          </div>

          {/* Duration Badge */}
          {durationDays !== null && durationDays > 0 && !hasValidationErrors && (
            <div className="flex items-center gap-2 px-4 py-3 bg-accent-primary/10 rounded-xl mt-[-8px]">
              <CalendarIcon className="w-5 h-5 text-accent-primary" />
              <span className="text-sm font-medium text-accent-primary">
                Тривалість: {durationDays} {getDaysDeclension(durationDays)}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {screenState === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-status-error/10 border border-status-error/20 rounded-xl mt-2 animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-status-error">
                  {hasApiError ? 'Помилка надсилання' : 'Виправте помилки перед надсиланням'}
                </span>
                {hasApiError && (
                  <span className="text-xs text-status-error/80 mt-1">{getApiErrorMessage()}</span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 pb-safe-area bg-bg-primary/90 backdrop-blur-md border-t border-white/5 flex items-center justify-center">
        <div className="w-full max-w-md">
          {screenState === 'success' ? (
            <button
              disabled
              className="w-full h-[52px] rounded-xl flex items-center justify-center gap-2 bg-status-success/10 text-status-success font-bold text-base transition-colors opacity-100 animate-in fade-in"
            >
              <CheckCircle2 className="w-5 h-5" />
              Відправлено
            </button>
          ) : (
            <button
              type="submit"
              form="absence-form"
              disabled={!isValid || isReadOnly}
              className={`w-full h-[52px] rounded-xl flex items-center justify-center font-bold text-base transition-all active:scale-[0.98] outline-none
                ${(!isValid || isReadOnly) 
                  ? 'bg-white/5 text-content-tertiary cursor-not-allowed' 
                  : 'bg-accent-primary text-white hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/20'}
              `}
            >
              {screenState === 'submitting' ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Надіслати заявку'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
