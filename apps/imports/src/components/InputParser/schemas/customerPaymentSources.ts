import { z } from 'zod'

const schema = z
  .object({
    customer_id: z.string(),
    customer_token: z.optional(z.string()),
    payment_source_token: z.optional(z.string())
  })
  .passthrough()

export const csvCustomerPaymentSourcesSchema = z.array(schema)
