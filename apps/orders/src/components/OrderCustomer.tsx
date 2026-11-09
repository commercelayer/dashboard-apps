import {
  Button,
  ListItem,
  Section,
  StatusIcon,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
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
          <ListItem
            icon={<StatusIcon name="user" background="teal" gap="large" />}
            padding="xy"
            borderStyle="none"
            className={`mt-4 rounded bg-gray-50 ${canAccess("customers") ? "hover:bg-gray-100" : ""}`}
            {...navigateToCustomer}
          >
            <div>
              <Text tag="div" weight="semibold" size="small">
                {order.customer.email}
              </Text>
              <Text size="small" tag="div" variant="info" weight="medium">
                {order.customer.total_orders_count}{" "}
                {t("resources.orders.name", {
                  count: order.customer.total_orders_count ?? 0,
                }).toLowerCase()}
              </Text>
            </div>
          </ListItem>
        </Section>
      </>
    )
  },
)
