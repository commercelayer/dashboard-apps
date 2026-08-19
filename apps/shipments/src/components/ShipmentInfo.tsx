import {
  Button,
  Spacer,
  Stack,
  Text,
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
        <Stack>
          <InfoCell label={t("apps.shipments.details.origin")}>
            {shipment.stock_location?.name ?? <EmptyValue />}
          </InfoCell>
          <InfoCell label={t("resources.shipping_methods.name")}>
            {shipment.shipping_method?.name ?? <EmptyValue />}
          </InfoCell>
        </Stack>
        <Stack>
          <InfoCell label={t("resources.orders.name")}>
            {order?.number == null ? (
              <EmptyValue />
            ) : canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                #{order.number}
              </Button>
            ) : (
              `#${order.number}`
            )}
          </InfoCell>
          <InfoCell label={t("resources.customers.name")}>
            {customer?.email == null ? (
              <EmptyValue />
            ) : canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {customer.email}
              </Button>
            ) : (
              customer.email
            )}
          </InfoCell>
        </Stack>
      </>
    )
  },
)

/** One cell of the stack: a muted label above the value. */
function InfoCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div>
      <Spacer bottom="2">
        <Text size="small" tag="div" variant="info" weight="semibold">
          {label}
        </Text>
      </Spacer>
      <Text tag="div" weight="semibold">
        {children}
      </Text>
    </div>
  )
}

function EmptyValue(): React.JSX.Element {
  return <Text className="text-gray-300">&#8212;</Text>
}
