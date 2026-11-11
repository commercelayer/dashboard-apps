import {
  Button,
  Section,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { CustomerAvatar } from "dashboard-apps-common/src/components/CustomerAvatar"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useEditCustomerModal } from "./NewOrder/hooks/useEditCustomerModal"
import { useOrderStatus } from "./OrderSummary/hooks/useOrderStatus"

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element | null => {
    const { canAccess } = useTokenProvider()
    const { t } = useTranslation()
    const { mutateOrder } = useOrderDetails(order.id)
    const { isEditing } = useOrderStatus(order)
    const { modal: editCustomerModal, open: openEditCustomerModal } =
      useEditCustomerModal(order, () => {
        void mutateOrder()
      })
    const { navigateTo } = useAppLinking()

    if (order.customer == null) {
      return null
    }

    const navigateToCustomer = canAccess("customers")
      ? navigateTo({
          app: "customers",
          resourceId: order.customer.id,
        })
      : {}

    return (
      <>
        {editCustomerModal}
        <Section
          title={t("resources.customers.name")}
          actionButton={
            (order.status === "draft" || order.status === "pending") &&
            isEditing ? (
              <Button
                alignItems="center"
                variant="secondary"
                size="mini"
                onClick={() => {
                  openEditCustomerModal()
                }}
              >
                {t("common.edit")}
              </Button>
            ) : null
          }
        >
          <CustomerCard
            className="mt-4 flex items-center gap-4 p-4 rounded bg-gray-50 text-gray-800 hover:text-gray-800"
            {...navigateToCustomer}
          >
            <CustomerAvatar customer={order.customer} />
            {/* `min-w-0`, or the email would widen the card instead of being truncated */}
            <div className="min-w-0">
              <Text
                tag="div"
                weight="semibold"
                size="small"
                className="truncate"
                title={order.customer.email}
              >
                {order.customer.email}
              </Text>
              <Text size="x-small" tag="div" variant="info" weight="regular">
                {order.customer.has_password === true
                  ? t("apps.orders.details.customer_registered")
                  : t("apps.orders.details.customer_guest")}
                {" · "}
                {order.customer.total_orders_count ?? 0}{" "}
                {t("resources.orders.name", {
                  count: order.customer.total_orders_count ?? 0,
                }).toLowerCase()}
              </Text>
            </div>
          </CustomerCard>
        </Section>
      </>
    )
  },
)

/**
 * The customer card: a link to the customer when the user can access the
 * customers app, plain content otherwise. Not a `ListItem`, whose inner
 * containers can't shrink, so a long email could not be truncated.
 */
function CustomerCard({
  className,
  href,
  onClick,
  children,
}: {
  className: string
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  children: React.ReactNode
}): React.JSX.Element {
  if (href == null) {
    return <div className={className}>{children}</div>
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={`${className} hover:bg-gray-100 focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-hidden`}
    >
      {children}
    </a>
  )
}
