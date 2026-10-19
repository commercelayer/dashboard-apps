import { getGiftCardDisplayStatus } from "./giftCardStatus"

const now = new Date("2026-10-19T12:00:00.000Z")
const past = "2026-10-09T01:59:59.000Z"
const future = "2026-11-01T00:00:00.000Z"

describe("getGiftCardDisplayStatus", () => {
  test("should return the API status when the gift card never expires", () => {
    expect(
      getGiftCardDisplayStatus({ status: "active", expires_at: null }, now),
    ).toEqual("active")
  })

  test("should return the API status when the gift card expires in the future", () => {
    expect(
      getGiftCardDisplayStatus({ status: "active", expires_at: future }, now),
    ).toEqual("active")
    expect(
      getGiftCardDisplayStatus({ status: "inactive", expires_at: future }, now),
    ).toEqual("inactive")
  })

  test('should return "expired" for an active or inactive gift card past its expiration date', () => {
    expect(
      getGiftCardDisplayStatus({ status: "active", expires_at: past }, now),
    ).toEqual("expired")
    expect(
      getGiftCardDisplayStatus({ status: "inactive", expires_at: past }, now),
    ).toEqual("expired")
  })

  test('should return "expired" when the expiration date is exactly now', () => {
    expect(
      getGiftCardDisplayStatus(
        { status: "active", expires_at: now.toJSON() },
        now,
      ),
    ).toEqual("expired")
  })

  test("should keep draft and redeemed statuses even when past the expiration date", () => {
    expect(
      getGiftCardDisplayStatus({ status: "draft", expires_at: past }, now),
    ).toEqual("draft")
    expect(
      getGiftCardDisplayStatus({ status: "redeemed", expires_at: past }, now),
    ).toEqual("redeemed")
  })
})
