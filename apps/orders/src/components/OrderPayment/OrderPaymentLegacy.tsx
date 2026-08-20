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
 * The order's payment method, on the legacy payment model.
 * @deprecated Remove with the legacy payment model.
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
