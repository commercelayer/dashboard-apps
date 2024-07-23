import { z } from 'zod'

const schema = z
  .object({
    customer_email: z.string().email(),
    reference_origin: z.optional(z.string()),
    customer_group_id: z.optional(z.string().min(1))
  })
  .passthrough()

export const csvCustomerSubscriptionsSchema = z.array(schema)
