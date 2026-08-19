import {
  Button,
  Stack,
  StackCell,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Shipment } from "@commercelayer/sdk"

interface Props {
  shipment: Shipment
}

/**
 * Where the shipment ships from and how, then what it belongs to: the order and
 * its customer, both linked.
 *
 * Two stacks rather than one of four cells: consecutive stacks pull themselves
 * together into a single grid (`not-first:-mt-px`), so this reads as two rows of
 * two instead of four narrow columns — as in the stock transfers app.
 */
export const ShipmentInfo = withSkeletonTemplate<Props>(
  ({ shipment }): React.JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()
    const { t } = useTranslation()

    const order = shipment.order
    const customer = shipment.order?.customer

    const navigateToOrder =
      canAccess("orders") && order?.id != null
        ? navigateTo({ app: "orders", resourceId: order.id })
        : {}

    const navigateToCustomer =
      canAccess("customers") && customer?.id != null
        ? navigateTo({ app: "customers", resourceId: customer.id })
        : {}

    return (
      <>
        <Stack size="small">
          <StackCell label={t("apps.shipments.details.origin")}>
            {shipment.stock_location?.name}
          </StackCell>
          <StackCell label={t("resources.shipping_methods.name")}>
            {shipment.shipping_method?.name}
          </StackCell>
        </Stack>
        <Stack size="small">
          <StackCell label={t("resources.orders.name")}>
            {order?.number == null ? undefined : canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                #{order.number}
              </Button>
            ) : (
              `#${order.number}`
            )}
          </StackCell>
          <StackCell label={t("resources.customers.name")}>
            {customer?.email == null ? undefined : canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {customer.email}
              </Button>
            ) : (
              customer.email
            )}
          </StackCell>
        </Stack>
      </>
    )
  },
)
