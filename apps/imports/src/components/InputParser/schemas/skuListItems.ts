import { z } from 'zod'
import { zodEnforcePositiveInt } from './zodUtils'

const schema = z
  .object({
    position: z.optional(zodEnforcePositiveInt),
    sku_code: z.optional(z.string().min(1)),
    quantity: z.optional(zodEnforcePositiveInt),
    sku_list_id: z.optional(z.string().min(1)),
    sku_id: z.string().min(1)
  })
  .passthrough()

export const csvSkuListItemsSchema = z.array(schema)
