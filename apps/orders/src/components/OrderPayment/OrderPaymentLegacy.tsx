import {
  ResourcePaymentMethod,
  Section,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { hasPaymentMethod } from "#utils/order"

interface Props {
  order: Order
}

/**
 * Legacy (API version 2017-08) payment display, built around the order's
 * single `payment_method`/`payment_source` relationship.
 * @deprecated will be removed once orders created under the legacy API
 * version are no longer expected. See OrderPaymentSessions for the
 * 2026-05+ replacement.
 */
export const OrderPaymentLegacy = withSkeletonTemplate<Props>(({ order }) => {
  const { t } = useTranslation()
  if (!hasPaymentMethod(order) || order.payment_status === "free") {
    return null
  }

  return (
    <Section title={t("apps.orders.details.payment_method")} border="none">
      <ResourcePaymentMethod resource={order} showPaymentResponse />
    </Section>
  )
})
