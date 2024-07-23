import { z } from 'zod'

const schema = z
  .object({
    email: z.string().email(),
    password: z.optional(
      z.preprocess((value) => (value != null ? String(value) : ''), z.string())
    ),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string()),
    customer_group_id: z.optional(z.string().min(1))
  })
  .passthrough()

export const csvCustomersSchema = z.array(schema)
