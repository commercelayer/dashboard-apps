import {
  Button,
  Spacer,
  Stack,
  Text,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"

interface Props {
  stockTransfer: StockTransfer
}

/**
 * Where the transfer goes and what it belongs to: the two stock locations, then
 * the order and shipment it originates from, both linked.
 *
 * Two stacks rather than one of four cells: consecutive stacks pull themselves
 * together into a single grid (`not-first:-mt-px`), so this reads as two rows of
 * two instead of four narrow columns.
 *
 * A transfer created by hand has no shipment, and so no order either; those cells
 * fall back to a dash rather than disappearing, which would break the grid.
 */
export const StockTransferInfo = withSkeletonTemplate<Props>(
  ({ stockTransfer }): React.JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()

    const order = stockTransfer?.shipment?.order
    const shipment = stockTransfer?.shipment

    const navigateToOrder =
      canAccess("orders") && order?.id != null
        ? navigateTo({ app: "orders", resourceId: order.id })
        : {}

    const navigateToShipment =
      canAccess("shipments") && shipment?.id != null
        ? navigateTo({ app: "shipments", resourceId: shipment.id })
        : {}

    return (
      <>
        <Stack>
          <InfoCell label="Origin">
            {stockTransfer?.origin_stock_location?.name ?? <EmptyValue />}
          </InfoCell>
          <InfoCell label="Destination">
            {stockTransfer?.destination_stock_location?.name ?? <EmptyValue />}
          </InfoCell>
        </Stack>
        <Stack>
          <InfoCell label="Order">
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
          <InfoCell label="Shipment">
            {shipment?.number == null ? (
              <EmptyValue />
            ) : canAccess("shipments") ? (
              <Button variant="link" {...navigateToShipment}>
                #{shipment.number}
              </Button>
            ) : (
              `#${shipment.number}`
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
