import type { Shipment } from '@commercelayer/sdk'

export function getShipmentStatusName(status: Shipment['status']): string {
  const dictionary: Record<typeof status, string> = {
    cancelled: 'Cancelled',
    draft: 'Draft',
    upcoming: 'Upcoming',
    picking: 'Picking',
    packing: 'Packing',
    ready_to_ship: 'Ready to ship',
    shipped: 'Shipped',
    on_hold: 'On hold',
    delivered: 'Delivered'
  }

  return dictionary[status]
}
