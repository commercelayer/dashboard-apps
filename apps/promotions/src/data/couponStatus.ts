import type { Coupon } from "@commercelayer/sdk"

export type CouponStatus = "active" | "expired" | "never_expires"

/**
 * The API exposes no status for coupons, so it is derived from expiry alone,
 * matching the options of the status filter in the coupon list.
 * Usage is not a status: an exhausted coupon still reads as active.
 */
export function getCouponStatus(
  coupon: Pick<Coupon, "expires_at">,
  now: Date = new Date(),
): CouponStatus {
  if (coupon.expires_at == null) {
    return "never_expires"
  }

  return new Date(coupon.expires_at) <= now ? "expired" : "active"
}
