import type { GiftCard } from "@commercelayer/sdk"

export type GiftCardDisplayStatus = GiftCard["status"] | "expired"

/**
 * The API has no expired status: a gift card past its `expires_at` keeps the one
 * it had, so it is derived here. Only cards that could still be used read as
 * expired: a draft was never issued and a redeemed one is already spent.
 */
export function getGiftCardDisplayStatus(
  giftCard: Pick<GiftCard, "status" | "expires_at">,
  now: Date = new Date(),
): GiftCardDisplayStatus {
  if (
    (giftCard.status === "active" || giftCard.status === "inactive") &&
    isGiftCardExpired(giftCard, now)
  ) {
    return "expired"
  }

  return giftCard.status
}

export function isGiftCardExpired(
  giftCard: Pick<GiftCard, "expires_at">,
  now: Date = new Date(),
): boolean {
  return giftCard.expires_at != null && new Date(giftCard.expires_at) <= now
}
