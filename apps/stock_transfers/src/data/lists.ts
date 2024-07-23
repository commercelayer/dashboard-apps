import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType = 'on_hold' | 'picking' | 'in_transit' | 'history'

export const presets: Record<ListType, FormFullValues> = {
  on_hold: {
    status_in: ['on_hold'],
    archived_at_null: 'show',
    viewTitle: 'On hold'
  },
  picking: {
    status_in: ['picking'],
    archived_at_null: 'show',
    viewTitle: 'Picking'
  },
  in_transit: {
    status_in: ['in_transit'],
    archived_at_null: 'show',
    viewTitle: 'In transit'
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: 'All stock transfers'
  }
}
