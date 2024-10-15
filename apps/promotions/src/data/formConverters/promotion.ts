import type { promotionConfig } from '#data/promotions/config'
import type { Promotion } from '#types'
import { type z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function promotionToFormValues(promotion?: Promotion) {
  if (promotion == null) {
    return undefined
  }

  const standardFormValues = {
    ...promotion,
    starts_at: new Date(promotion.starts_at),
    expires_at: new Date(promotion.expires_at),
    show_priority: promotion.priority != null,
    reference:
      promotion.reference != null && promotion.reference !== ''
        ? promotion.reference
        : null
  }

  if (promotion.type === 'flex_promotions') {
    return {
      ...standardFormValues,
      rules:
        promotion.rules != null
          ? JSON.stringify(promotion.rules, undefined, 2)
          : undefined
    }
  }

  return {
    ...standardFormValues,
    apply_the_discount_to: promotion.sku_list != null ? 'sku_list' : 'all',
    sku_list: promotion.sku_list?.id
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formValuesToPromotion(
  promotionType: Promotion['type'],
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
    rules:
      'rules' in formValues && formValues.rules != null
        ? JSON.parse(formValues.rules as string)
        : undefined,
    priority:
      'priority' in formValues && formValues.priority != null
        ? formValues.priority
        : null,
    sku_list:
      promotionType !== 'flex_promotions'
        ? {
            type: 'sku_lists',
            id:
              'sku_list' in formValues && formValues.sku_list != null
                ? formValues.sku_list
                : null
          }
        : undefined
  }
}
