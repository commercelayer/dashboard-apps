import type {
  BuyXPayYPromotion,
  CouponCodesPromotionRule,
  CustomPromotionRule,
  ExternalPromotion,
  FixedAmountPromotion,
  FixedPricePromotion,
  FlexPromotion,
  FreeGiftPromotion,
  FreeShippingPromotion,
  OrderAmountPromotionRule,
  PercentageDiscountPromotion,
  SkuListPromotionRule
} from '@commercelayer/sdk'

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type Promotion = (
  | Omit<BuyXPayYPromotion, 'promotion_rules'>
  | Omit<ExternalPromotion, 'promotion_rules'>
  | Omit<FixedAmountPromotion, 'promotion_rules'>
  | Omit<FixedPricePromotion, 'promotion_rules'>
  | Omit<FlexPromotion, 'promotion_rules'>
  | Omit<FreeGiftPromotion, 'promotion_rules'>
  | Omit<FreeShippingPromotion, 'promotion_rules'>
  | Omit<PercentageDiscountPromotion, 'promotion_rules'>
) & {
  promotion_rules?: PromotionRule[] | null
}

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type PromotionRule =
  | CustomPromotionRule
  | SkuListPromotionRule
  | CouponCodesPromotionRule
  | OrderAmountPromotionRule
