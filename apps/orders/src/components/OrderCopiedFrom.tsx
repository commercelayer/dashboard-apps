import { A, useTranslation } from "@commercelayer/app-elements"
import { Link } from "wouter"
import { appRoutes } from "#data/routes"
import { useSourceOrder } from "#hooks/useSourceOrder"

/** "Copied from order #1234" on an order duplicated from another one. */
export const OrderCopiedFrom: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { t } = useTranslation()
  const { sourceOrder } = useSourceOrder(orderId)

  if (sourceOrder == null) {
    return null
  }

  const href = appRoutes.details.makePath({ orderId: sourceOrder.id })

  return (
    <div>
      {t("apps.orders.details.copied_from")}{" "}
      <Link href={href} asChild>
        <A href={href}>#{sourceOrder.number}</A>
      </Link>
    </div>
  )
}
