import { z, type ZodTypeAny } from 'zod'

import { isFalsy } from '#utils/isFalsy'
import { zodEnforceBoolean } from './zodUtils'

const makeSchema = (): ZodTypeAny =>
  z
    .object({
      business: zodEnforceBoolean({ optional: true }),
      first_name: z.optional(z.string().min(1)),
      last_name: z.optional(z.string().min(1)),
      company: z.optional(z.string().min(1)),
      line_1: z.string().min(1),
      line_2: z.optional(z.string().min(1)),
      city: z.string().min(1),
      zip_code: z.string().min(1),
      state_code: z.string().min(1).max(2),
      country_code: z.string().min(1).max(2),
      phone: z.string().min(1),
      email: z.optional(z.string().email()),
      notes: z.optional(z.string()),
      lat: z.optional(z.number()),
      lng: z.optional(z.number()),
      billing_info: z.optional(z.string()),
      reference: z.optional(z.string()),
      reference_origin: z.optional(z.string())
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (isFalsy(data.business) && isFalsy(data.first_name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['first_name'],
          message: 'first_name is required if business is false'
        })
      }
      if (isFalsy(data.business) && isFalsy(data.last_name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['last_name'],
          message: 'last_name is required if business is false'
        })
      }
      if (data.business === true && isFalsy(data.company)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['company'],
          message: 'company is required if business is true'
        })
      }
    })

export const csvAddressSchema = z.array(makeSchema())
