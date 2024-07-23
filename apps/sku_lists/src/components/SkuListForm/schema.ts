import { z } from 'zod'
import type { FormSkuListItem } from './SkuListForm'

const formSkuListItemSchema: z.ZodType<FormSkuListItem> = z.object({
  id: z.string(),
  sku_code: z.string().min(1),
  quantity: z.number().min(1),
  position: z.number().min(1),
  sku: z.object({
    id: z.string().min(1),
    code: z.string().min(1),
    name: z.string().min(1),
    image_url: z.string().optional()
  })
})

const formBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1)
})

const formWithManualItemsSchema = formBaseSchema.extend({
  manual: z.literal(true),
  items: z.array(formSkuListItemSchema)
})

const formWithAutoItemsSchema = formBaseSchema.extend({
  manual: z.literal(false),
  sku_code_regex: z.string().min(1)
})

export const skuListFormSchema = z.discriminatedUnion('manual', [
  formWithManualItemsSchema,
  formWithAutoItemsSchema
])
