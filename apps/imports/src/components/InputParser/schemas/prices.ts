/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'
import { zodEnforcePositiveInt, zodEnforceNonNegativeInt } from './zodUtils'

const makeSchema = (hasParentResourceId: boolean) =>
  z
    .object({
      amount_cents: zodEnforceNonNegativeInt,
      compare_at_amount_cents: z.optional(zodEnforceNonNegativeInt),
      price_list_id: z.optional(z.string().min(1)),
      sku_code: z.optional(z.string()),
      reference: z.optional(z.string()),
      reference_origin: z.optional(z.string()),
      // price_tiers relationship
      'price_tiers.type': z.optional(z.literal('PriceVolumeTier')),
      'price_tiers.name': z.optional(z.string().min(1)),
      'price_tiers.up_to': z.optional(zodEnforcePositiveInt),
      'price_tiers.price_amount_cents': z.optional(zodEnforcePositiveInt)
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (!hasParentResourceId && isFalsy(data.price_list_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price_list_id'],
          message: 'price_list_id is required if parent resource is not set'
        })
      }

      if (
        !isFalsy(data['price_tiers.type']) &&
        isFalsy(data['price_tiers.name'])
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price_tiers.name'],
          message: 'price_tiers.name is required if price_tiers is set'
        })
      }

      if (
        !isFalsy(data['price_tiers.type']) &&
        isFalsy(data['price_tiers.price_amount_cents'])
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price_tiers.price_amount_cents'],
          message:
            'price_tiers.price_amount_cents is required if price_tiers is set'
        })
      }
    })

export const csvPricesSchema = ({
  hasParentResource
}: {
  hasParentResource: boolean
}) => z.array(makeSchema(hasParentResource))
