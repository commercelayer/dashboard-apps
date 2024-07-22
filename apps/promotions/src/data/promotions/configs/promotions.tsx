import { z } from 'zod'

export const genericPromotionOptions = z.object({
  name: z.string().min(1),
  starts_at: z.date(),
  expires_at: z.date(),
  reference: z.string().nullish(),
  total_usage_limit: z
    .number()
    .min(1)
    .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$|^$/))
    .nullish()
    .transform((p) =>
      p != null && p !== '' ? parseInt(p.toString()) : undefined
    ),
  exclusive: z.boolean().default(false),
  priority: z
    .number()
    .min(1)
    .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$|^$/))
    .nullish()
    .transform((p) =>
      p != null && p !== '' ? parseInt(p.toString()) : undefined
    )
})
