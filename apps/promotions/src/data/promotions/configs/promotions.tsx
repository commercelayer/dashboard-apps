import { z } from 'zod'

export const genericPromotionOptions = z.object({
  name: z.string().min(1),
  starts_at: z.date(),
  expires_at: z.date(),
  reference: z.string().nullish(),
  total_usage_limit: z.preprocess((value) => {
    return Number.isNaN(value) ? null : value
  }, z.number().min(1).nullish()),
  exclusive: z.boolean().default(false),
  priority: z.preprocess((value) => {
    return Number.isNaN(value) ? null : value
  }, z.number().min(1).nullish())
})
