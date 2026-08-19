import {
  Button,
  Stack,
  StackCell,
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
        <Stack size="small">
          <StackCell label="Origin">
            {stockTransfer?.origin_stock_location?.name}
          </StackCell>
          <StackCell label="Destination">
            {stockTransfer?.destination_stock_location?.name}
          </StackCell>
        </Stack>
        <Stack size="small">
          <StackCell label="Order">
            {order?.number == null ? undefined : canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                #{order.number}
              </Button>
            ) : (
              `#${order.number}`
            )}
          </StackCell>
          <StackCell label="Shipment">
            {shipment?.number == null ? undefined : canAccess("shipments") ? (
              <Button variant="link" {...navigateToShipment}>
                #{shipment.number}
              </Button>
            ) : (
              `#${shipment.number}`
            )}
          </StackCell>
        </Stack>
      </>
    )
  },
)
