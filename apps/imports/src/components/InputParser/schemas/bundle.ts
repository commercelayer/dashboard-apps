/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'
import { zodEnforceBoolean, zodEnforcePositiveInt } from './zodUtils'

const makeSchema = (hasParentResourceId: boolean) =>
  z
    .object({
      code: z.string(),
      name: z.string(),
      currency_code: z.optional(z.string().min(1)),
      description: z.optional(z.string().min(1)),
      image_url: z.optional(z.string().url()),
      do_not_ship: zodEnforceBoolean({ optional: true }),
      do_not_track: zodEnforceBoolean({ optional: true }),
      price_amount_cents: zodEnforcePositiveInt,
      compare_at_amount_cents: zodEnforcePositiveInt,
      _compute_price_amount: zodEnforceBoolean({ optional: true }),
      _compute_compare_at_amount: zodEnforceBoolean({ optional: true }),
      market_id: z.optional(z.string().min(1)),
      sku_list_id: z.optional(z.string())
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (isFalsy(data.market_id) && isFalsy(data.currency_code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currency_code'],
          message: 'currency_code is required if market_id is not set'
        })
      }
      if (!hasParentResourceId && isFalsy(data.sku_list_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sku_list_id'],
          message: 'sku_list_id is required if parent resource is not set'
        })
      }
    })

export const csvBundleSchema = ({
  hasParentResource
}: {
  hasParentResource: boolean
}) => z.array(makeSchema(hasParentResource))
