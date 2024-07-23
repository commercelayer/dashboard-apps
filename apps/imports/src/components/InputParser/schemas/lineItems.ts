import { z } from 'zod'

import { zodEnforcePositiveInt } from './zodUtils'
import { zodEnforceInt } from '#components/InputParser/schemas/zodUtils'

const schema = z
  .object({
    sku_code: z.optional(z.string().min(1)),
    bundle_code: z.optional(z.string().min(1)),
    quantity: zodEnforcePositiveInt,
    unit_amount_cents: z.optional(zodEnforceInt),
    name: z.optional(z.string().min(1)),
    image_url: z.optional(z.string().url()),
    item_type: z.optional(z.string().min(1)),
    frequency: z.optional(z.string().min(1)),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string()),
    order_id: z.string().min(1)
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.sku_code != null && data.bundle_code != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sku_code'],
        message: 'Only one between `sku_code` and `bundle_code` is allowed'
      })
    }
  })

export const csvLineItemsSchema = z.array(schema)
