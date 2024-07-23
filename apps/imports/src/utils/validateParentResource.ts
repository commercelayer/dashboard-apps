import {
  type CommerceLayerClient,
  type CouponCodesPromotionRuleCreate,
  type Promotion
} from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'

export async function validateParentResource({
  sdkClient,
  resourceType,
  parentResourceId
}: {
  resourceType: AllowedResourceType
  parentResourceId?: string
  sdkClient: CommerceLayerClient
}): Promise<string | undefined> {
  if (parentResourceId == null) {
    return undefined
  }

  // In case of coupons, the UI will show `promotions` as parent resources
  // but API requires `coupon_codes_promotion_rule` as real parent resource.
  // So we need to check if selected promotion has a `coupon_codes_promotion_rule`
  // otherwise we need to create it.
  // Anyway the `parentResourceId` to returns must be of a `coupon_codes_promotion_rule`.
  if (resourceType === 'coupons') {
    const promotion = await fetchPromotionWithCouponPromotionRule(
      sdkClient,
      parentResourceId
    )
    return await getOrCreateCouponCodePromotionRuleId(sdkClient, promotion)
  }

  return parentResourceId
}

async function fetchPromotionWithCouponPromotionRule(
  sdkClient: CommerceLayerClient,
  promotionId: string
): Promise<Promotion> {
  return await sdkClient.promotions.retrieve(promotionId, {
    fields: {
      promotions: ['id', 'name', 'coupon_codes_promotion_rule'],
      // @ts-expect-error this is a valid field
      coupon_codes_promotion_rule: ['id']
    },
    include: ['coupon_codes_promotion_rule']
  })
}

async function getOrCreateCouponCodePromotionRuleId(
  sdkClient: CommerceLayerClient,
  promotion: Promotion
): Promise<string> {
  const existingPromotionRuleId = promotion.coupon_codes_promotion_rule?.id
  if (existingPromotionRuleId != null) {
    return existingPromotionRuleId
  }

  const newCouponCodePromotionRule =
    await sdkClient.coupon_codes_promotion_rules.create({
      promotion: {
        id: promotion.id,
        type: promotion.type as CouponCodesPromotionRuleCreate['promotion']['type']
      }
    })
  return newCouponCodePromotionRule.id
}
