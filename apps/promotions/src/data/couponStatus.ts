import type { Coupon } from "@commercelayer/sdk"

export type CouponStatus = "available" | "used" | "expired"

/**
 * The API exposes no status for coupons, so it is derived from expiry and usage.
 * Expiry wins over usage: an expired coupon reads as expired even when exhausted.
 */
export function getCouponStatus(
  coupon: Pick<Coupon, "expires_at" | "usage_count" | "usage_limit">,
  now: Date = new Date(),
): CouponStatus {
  if (coupon.expires_at != null && new Date(coupon.expires_at) <= now) {
    return "expired"
  }

  if (
    coupon.usage_limit != null &&
    (coupon.usage_count ?? 0) >= coupon.usage_limit
  ) {
    return "used"
  }

  return "available"
}
