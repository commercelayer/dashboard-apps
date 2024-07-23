import { z } from 'zod'

const schema = z
  .object({
    name: z.string().min(1),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string())
  })
  .passthrough()

export const csvShippingCategorySchema = z.array(schema)
