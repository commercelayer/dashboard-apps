import type { Promotion } from "#types"

/**
 * A one-line summary of what a promotion gives away, per type.
 *
 * There is no such value on the resource and no shared helper for it: each
 * promotion type keeps its discount in its own attribute, so they are spelled out
 * here. `undefined` when the type carries no expressible discount.
 */
export function getPromotionDiscount(promotion: Promotion): string | undefined {
  switch (promotion.type) {
    case "percentage_discount_promotions":
      return promotion.percentage != null
        ? `${promotion.percentage}%`
        : undefined

    case "fixed_amount_promotions":
      return promotion.formatted_fixed_amount ?? undefined

    case "fixed_price_promotions":
      return promotion.formatted_fixed_amount ?? undefined

    case "free_shipping_promotions":
      return "Free shipping"

    case "free_gift_promotions":
      return "Free gift"

    case "buy_x_pay_y_promotions":
      return promotion.x != null && promotion.y != null
        ? `Buy ${promotion.x} pay ${promotion.y}`
        : undefined

    case "external_promotions":
      return "External"

    case "flex_promotions":
      return "Flex"

    default:
      return undefined
  }
}
