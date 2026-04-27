import type { CustomPromotionRule } from "@commercelayer/sdk"
import type { PromotionRule } from "#types"
import { makeResource } from "../resource"

export const makeCustomPromotionRule = (
  overrides?: Partial<CustomPromotionRule>,
): PromotionRule => {
  return {
    ...makeResource(),
    type: "custom_promotion_rules",
    ...overrides,
  }
}
