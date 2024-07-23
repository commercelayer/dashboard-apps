import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

import { zodEnforceBoolean } from './zodUtils'

const schema = z
  .object({
    name: z.string().min(1),
    description: z.optional(z.string()),
    image_url: z.optional(z.string().url()),
    manual: zodEnforceBoolean({ optional: true }),
    sku_code_regex: z.optional(z.string()),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string()),
    'sku_list_items.sku_code': z.optional(z.string().min(1))
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (isFalsy(data.manual) && isFalsy(data.sku_code_regex)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sku_code_regex'],
        message: 'sku_code_regex is required, if manual is falsy'
      })
    }
  })

export const csvSkuListSchema = z.array(schema)
