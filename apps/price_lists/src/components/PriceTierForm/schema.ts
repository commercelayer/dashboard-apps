import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

const baseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  currency_code: z.string().min(1),
  price: z
    .number({
      message: 'Please enter a valid price',
      invalid_type_error: 'Please enter a valid price'
    })
    .min(0)
})

export const priceTierVolumeFormSchema = baseSchema
  .extend({
    type: z.literal('volume'),
    up_to: z.preprocess((value) => {
      return Number.isNaN(value) ? null : value
    }, z.number().min(0).nullish())
  })
  .passthrough()

export const priceTierFrequencyFormSchema = baseSchema
  .extend({
    type: z.literal('frequency'),
    up_to: z.string(),
    up_to_days: z.preprocess((value) => {
      return Number.isNaN(value) ? null : value
    }, z.number().min(0).nullish())
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
