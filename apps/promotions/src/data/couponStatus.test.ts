import { getCouponStatus } from "./couponStatus"

const now = new Date("2026-05-10T12:00:00.000Z")

describe("getCouponStatus", () => {
  test('should return "never_expires" when the coupon has no expiry', () => {
    expect(getCouponStatus({ expires_at: null }, now)).toEqual("never_expires")
  })

  test('should return "active" when the expiry date is in the future', () => {
    expect(
      getCouponStatus({ expires_at: "2026-06-01T00:00:00.000Z" }, now),
    ).toEqual("active")
  })

  test('should return "expired" when the expiry date is in the past', () => {
    expect(
      getCouponStatus({ expires_at: "2026-05-01T00:00:00.000Z" }, now),
    ).toEqual("expired")
  })
})
