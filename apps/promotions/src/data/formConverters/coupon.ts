import type { Coupon, CouponCreate, CouponUpdate } from '@commercelayer/sdk'
import { z } from 'zod'

export const couponForm = z.object({
  code: z.string().min(8).max(40),
  expires_at: z.date().nullish(),
  usage_limit: z
    .number()
    .min(1)
    .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$|^$/))
    .nullish()
    .transform((p) =>
      p != null && p !== '' ? parseInt(p.toString()) : undefined
    ),
  recipient_email: z.string().nullish(),
  customer_single_use: z.boolean().default(false)
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function couponToFormValues(coupon?: Coupon) {
  if (coupon == null) {
    return undefined
  }

  return {
    ...coupon,
    expires_at:
      coupon.expires_at != null ? new Date(coupon.expires_at) : undefined,
    show_usage_limit: coupon.usage_limit != null,
    show_recipient_email: coupon.recipient_email != null,
    customer_single_use: coupon.customer_single_use ?? false,
    usage_limit: coupon.usage_limit ?? undefined
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formValuesToCoupon(formValues: z.infer<typeof couponForm>) {
  return {
    ...formValues,
    expires_at:
      'expires_at' in formValues && formValues.expires_at != null
        ? formValues.expires_at.toJSON()
        : null,
    usage_limit:
      'usage_limit' in formValues && formValues.usage_limit != null
        ? formValues.usage_limit
        : null,
    recipient_email:
      'recipient_email' in formValues && formValues.recipient_email != null
        ? formValues.recipient_email
        : null
  } satisfies Omit<CouponCreate, 'id'> | Omit<CouponUpdate, 'id'>
}
