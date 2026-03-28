import { z } from 'zod';
import { startOfDay } from 'date-fns';

export const absenceRequestSchema = z
  .object({
    type: z.string().min(1, 'Оберіть тип відсутності'),
    start_date: z.date({
      message: 'Оберіть коректну дату початку',
    }),
    end_date: z.date({
      message: 'Оберіть коректну дату закінчення',
    }),
    reason: z.string().max(500, 'Причина має бути не довшою за 500 символів').optional(),
  })
  .superRefine((data, ctx) => {
    const today = startOfDay(new Date());
    const start = startOfDay(data.start_date);
    const end = startOfDay(data.end_date);

    if (start < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['start_date'],
        message: 'Дата початку не може бути в минулому',
      });
    }

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'Дата закінчення повинна бути після дати початку',
      });
    }
  });

export type AbsenceFormValues = z.infer<typeof absenceRequestSchema>;
