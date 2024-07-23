import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

const schema = z
  .object({
    sku_code: z.optional(z.string().min(1)),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string()),
    sku_id: z.optional(z.string().min(1)),
    tax_calculator_id: z.string().min(1)
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (isFalsy(data.sku_code) && isFalsy(data.sku_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sku_id'],
        message: 'sku_id is required, if sku_code is not present'
      })
    }
  })

export const csvTaxCategoriesSchema = z.array(schema)
