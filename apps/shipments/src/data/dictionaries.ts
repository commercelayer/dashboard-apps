import { t } from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

export function getShipmentStatusName(status: Shipment['status']): string {
  const dictionary: Record<typeof status, string> = {
    cancelled: t('resources.shipments.attributes.status.cancelled'),
    draft: t('resources.shipments.attributes.status.draft'),
    upcoming: t('resources.shipments.attributes.status.upcoming'),
    picking: t('resources.shipments.attributes.status.picking'),
    packing: t('resources.shipments.attributes.status.packing'),
    ready_to_ship: t('resources.shipments.attributes.status.ready_to_ship'),
    shipped: t('resources.shipments.attributes.status.shipped'),
    on_hold: t('resources.shipments.attributes.status.on_hold'),
    delivered: t('resources.shipments.attributes.status.delivered')
  }

  return dictionary[status]
}
