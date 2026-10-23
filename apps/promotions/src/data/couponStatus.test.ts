import { getCouponStatus } from "./couponStatus"

const now = new Date("2026-05-10T12:00:00.000Z")

describe("getCouponStatus", () => {
  test('should return "available" when the coupon has no expiry and no usage limit', () => {
    expect(getCouponStatus({ expires_at: null, usage_count: 23 }, now)).toEqual(
      "available",
    )
  })

  test('should return "available" when the usage limit is not reached yet', () => {
    expect(
      getCouponStatus(
        {
          expires_at: "2026-06-01T00:00:00.000Z",
          usage_count: 45,
          usage_limit: 100,
        },
        now,
      ),
    ).toEqual("available")
  })

  test('should return "used" when the usage limit is reached', () => {
    expect(getCouponStatus({ usage_count: 1, usage_limit: 1 }, now)).toEqual(
      "used",
    )
  })

  test('should return "expired" when the expiry date is in the past', () => {
    expect(
      getCouponStatus(
        { expires_at: "2026-05-01T00:00:00.000Z", usage_count: 0 },
        now,
      ),
    ).toEqual("expired")
  })

  test('should return "expired" over "used" when both apply', () => {
    expect(
      getCouponStatus(
        {
          expires_at: "2026-05-01T00:00:00.000Z",
          usage_count: 1,
          usage_limit: 1,
        },
        now,
      ),
    ).toEqual("expired")
  })
})
