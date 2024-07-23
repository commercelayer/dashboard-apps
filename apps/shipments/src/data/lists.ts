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
    viewTitle: 'Picking'
  },
  packing: {
    status_eq: 'packing',
    archived_at_null: 'show',
    viewTitle: 'Packing'
  },
  readyToShip: {
    status_eq: 'ready_to_ship',
    archived_at_null: 'show',
    viewTitle: 'Ready to ship'
  },
  onHold: {
    status_eq: 'on_hold',
    archived_at_null: 'show',
    viewTitle: 'On hold'
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: 'All shipments'
  }
}
