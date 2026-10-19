import type { Coupon } from "@commercelayer/sdk"

export type CouponStatus = "available" | "expired"

/**
 * The API exposes no status for coupons, so it is derived from expiry alone.
 * Usage is not a status: an exhausted coupon still reads as available.
 */
export function getCouponStatus(
  coupon: Pick<Coupon, "expires_at">,
  now: Date = new Date(),
): CouponStatus {
  if (coupon.expires_at != null && new Date(coupon.expires_at) <= now) {
    return "expired"
  }

  return "available"
}
