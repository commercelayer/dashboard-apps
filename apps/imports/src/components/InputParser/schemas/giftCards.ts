import { z } from 'zod'

import {
  zodEnforceBoolean,
  zodEnforceDateString,
  zodEnforceNonNegativeInt
} from './zodUtils'

const schema = z
  .object({
    code: z.optional(z.string().min(8)),
    currency_code: z.optional(z.string().min(1)),
    balance_cents: zodEnforceNonNegativeInt,
    balance_max_cents: z.optional(z.string()),
    single_use: zodEnforceBoolean({ optional: true }),
    rechargeable: zodEnforceBoolean({ optional: true }),
    image_url: z.optional(z.string().url()),
    expires_at: z.optional(zodEnforceDateString), // 2018-01-02T12:00:00.000Z
    recipient_email: z.optional(z.string()),
    reference: z.optional(z.string()),
    reference_origin: z.optional(z.string()),
    market_id: z.optional(z.string().min(1)),
    gift_card_recipient_id: z.optional(z.string().min(1))
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.market_id == null && data.currency_code == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currency_code'],
        message: 'currency_code is required if no market_id is specified'
      })
    }
  })

export const csvGiftCardsSchema = z.array(schema)
