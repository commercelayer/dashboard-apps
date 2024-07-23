/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'
import { zodCaseInsensitiveNativeEnum, zodEnforceBoolean } from './zodUtils'

enum AllowedStatus {
  'draft' = 'draft',
  'pending' = 'pending',
  'placed' = 'placed',
  'approved' = 'approved',
  'cancelled' = 'cancelled'
}

const makeSchema = (hasParentResourceId: boolean) =>
  z
    .object({
      autorefresh: zodEnforceBoolean({ optional: true }),
      guest: zodEnforceBoolean({ optional: true }),
      customer_email: z.optional(z.string().email()),
      customer_password: z.optional(z.string().min(1)),
      language_code: z.optional(z.string().min(1).max(2)),
      shipping_country_code_lock: z.optional(z.string().min(1)),
      coupon_code: z.optional(z.string().min(1)),
      gift_card_code: z.optional(z.string().min(1)),
      gift_card_or_coupon_code: z.optional(z.string().min(1)),
      cart_url: z.optional(z.string().min(1)),
      return_url: z.optional(z.string().min(1)),
      terms_url: z.optional(z.string().min(1)),
      privacy_url: z.optional(z.string().min(1)),
      market_id: z.optional(z.string()),
      payment_method_id: z.optional(z.string()),

      // some custom definitions to handle importing of orders with status
      // to do so we need to import them as archived
      status: z.optional(zodCaseInsensitiveNativeEnum(AllowedStatus)),
      _archive: zodEnforceBoolean({ optional: true })
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (!hasParentResourceId && isFalsy(data.market_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['market_id'],
          message: 'market_id is required if parent resource is not set'
        })
      }

      // validate orders status to allow
      if (data.status != null && data._archive !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['status'],
          message: 'To import a status set `_archive` as true'
        })
      }
    })

export const csvOrdersSchema = ({
  hasParentResource
}: {
  hasParentResource: boolean
}) => z.array(makeSchema(hasParentResource))
