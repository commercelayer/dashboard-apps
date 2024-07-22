import type { promotionConfig } from '#data/promotions/config'
import type { Promotion } from '#types'
import { type z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function promotionToFormValues(promotion?: Promotion) {
  if (promotion == null) {
    return undefined
  }

  return {
    ...promotion,
    starts_at: new Date(promotion.starts_at),
    expires_at: new Date(promotion.expires_at),
    apply_the_discount_to: promotion.sku_list != null ? 'sku_list' : 'all',
    show_priority: promotion.priority != null,
    sku_list: promotion.sku_list?.id,
    reference:
      promotion.reference != null && promotion.reference !== ''
        ? promotion.reference
        : null
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formValuesToPromotion(
  formValues?: z.infer<
    (typeof promotionConfig)[keyof typeof promotionConfig]['formType']
  >
) {
  if (formValues == null) {
    return undefined
  }

  return {
    ...formValues,
    total_usage_limit:
      'total_usage_limit' in formValues && formValues.total_usage_limit != null
        ? formValues.total_usage_limit
        : null,
    reference:
      'reference' in formValues &&
      formValues.reference != null &&
      formValues.reference !== ''
        ? formValues.reference
        : null,
    priority:
      'priority' in formValues && formValues.priority != null
        ? formValues.priority
        : null,
    sku_list: {
      type: 'sku_lists',
      id:
        'sku_list' in formValues && formValues.sku_list != null
          ? formValues.sku_list
          : null
    }
  }
}
