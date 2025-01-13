import { t } from '@commercelayer/app-elements'
import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType =
  | 'picking'
  | 'packing'
  | 'readyToShip'
  | 'onHold'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  picking: {
    status_eq: 'picking',
    archived_at_null: 'show',
    viewTitle: t('apps.shipments.tasks.picking')
  },
  packing: {
    status_eq: 'packing',
    archived_at_null: 'show',
    viewTitle: t('apps.shipments.tasks.packing')
  },
  readyToShip: {
    status_eq: 'ready_to_ship',
    archived_at_null: 'show',
    viewTitle: t('apps.shipments.tasks.ready_to_ship')
  },
  onHold: {
    status_eq: 'on_hold',
    archived_at_null: 'show',
    viewTitle: t('apps.shipments.tasks.on_hold')
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: t('apps.shipments.tasks.all_shipments')
  }
}
