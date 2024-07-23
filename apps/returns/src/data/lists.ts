import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType =
  | 'requested'
  | 'approved'
  | 'shipped'
  | 'archived'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  requested: {
    status_in: ['requested'],
    archived_at_null: 'show',
    viewTitle: 'Requested'
  },
  approved: {
    status_in: ['approved'],
    archived_at_null: 'show',
    viewTitle: 'Approved'
  },
  shipped: {
    status_in: ['shipped'],
    archived_at_null: 'show',
    viewTitle: 'Shipped'
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: 'All returns'
  },
  archived: {
    archived_at_null: 'only',
    viewTitle: 'Archived'
  }
}
