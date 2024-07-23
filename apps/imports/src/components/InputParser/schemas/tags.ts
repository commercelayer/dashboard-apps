import { z } from 'zod'

const schema = z
  .object({
    name: z.optional(z.string().min(1))
  })
  .passthrough()

export const csvTagsSchema = z.array(schema)
