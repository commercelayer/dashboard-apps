import { z } from 'zod'

const formBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  manualString: z.string().nullable()
})

const formWithManualItemsSchema = formBaseSchema.extend({
  manual: z.literal(true)
})

const formWithAutoItemsSchema = formBaseSchema.extend({
  manual: z.literal(false),
  sku_code_regex: z.string().min(1)
})

export const skuListFormSchema = z.discriminatedUnion('manual', [
  formWithManualItemsSchema,
  formWithAutoItemsSchema
])
