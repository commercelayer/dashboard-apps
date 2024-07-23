/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'
import { zodEnforcePositiveInt } from './zodUtils'

const makeSchema = (hasParentResourceId: boolean) =>
  z
    .object({
      name: z.string().min(1),
      currency_code: z.optional(z.string().min(1)), // Required, unless inherited by market
      market_id: z.optional(z.string().min(1)),
      description: z.optional(z.string().min(1)),
      price_amount_cents: z.optional(zodEnforcePositiveInt),
      delay_hours: z.optional(zodEnforcePositiveInt),
      sku_code_regex: z.optional(z.string().min(1)),
      reference: z.optional(z.string()),
      reference_origin: z.optional(z.string())
    })
    .passthrough()
    .superRefine((data, ctx) => {
      const noMarket = !hasParentResourceId && isFalsy(data.market_id)
      if (noMarket && isFalsy(data.currency_code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currency_code'],
          message:
            'currency_code is required if market_id or parent resource is not set'
        })
      }
    })

export const csvSkuOptionSchema = ({
  hasParentResource
}: {
  hasParentResource: boolean
}) => z.array(makeSchema(hasParentResource))
