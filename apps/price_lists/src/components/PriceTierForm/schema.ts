import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

export const priceTierFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1),
    currency_code: z.string().min(1),
    up_to: z.string(),
    up_to_days: z.string().optional(),
    price: z.number(),
    type: z.string()
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.up_to === 'custom' && isFalsy(data.up_to_days)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['up_to_days'],
        message: 'Required'
      })
    }
  })
