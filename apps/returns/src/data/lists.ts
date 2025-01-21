import { t } from '@commercelayer/app-elements'
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
    viewTitle: t('apps.returns.tasks.requested')
  },
  approved: {
    status_in: ['approved'],
    archived_at_null: 'show',
    viewTitle: t('apps.returns.tasks.approved')
  },
  shipped: {
    status_in: ['shipped'],
    archived_at_null: 'show',
    viewTitle: t('apps.returns.tasks.shipped')
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: t('apps.returns.tasks.all_returns')
  },
  archived: {
    archived_at_null: 'only',
    viewTitle: t('apps.returns.tasks.archived')
  }
}
