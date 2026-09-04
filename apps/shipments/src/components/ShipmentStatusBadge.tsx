import {
  getShipmentDisplayStatus,
  ResourceStatusBadge,
} from "@commercelayer/app-elements"
import type { Shipment } from "@commercelayer/sdk"

interface Props {
  shipment: Shipment
  /**
   * `true` when the shipment is held by stock transfers that are still open: the
   * display status then reads as awaiting them, rather than as a plain hold.
   */
  awaitingStockTransfer?: boolean
  className?: string
}

/**
 * The shipment's display status, as a badge.
 *
 * Shared by the page title, the Status column and — on mobile, where that column
 * is hidden — the name cell, so the three can never drift apart.
 */
export function ShipmentStatusBadge({
  shipment,
  awaitingStockTransfer = false,
  className,
}: Props): React.JSX.Element {
  const displayStatus = getShipmentDisplayStatus(
    shipment,
    awaitingStockTransfer,
  )
  return <ResourceStatusBadge status={displayStatus} className={className} />
}
