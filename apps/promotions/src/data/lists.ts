import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType = 'active' | 'upcoming' | 'disabled'

const today = new Date().toJSON()

export const presets: Record<ListType, FormFullValues> = {
  active: {
    starts_at_lteq: [today],
    expires_at_gteq: [today],
    disabled_at_null: 'true',
    viewTitle: 'Active'
  },
  upcoming: {
    starts_at_gt: [today],
    disabled_at_null: 'true',
    viewTitle: 'Upcoming'
  },
  disabled: {
    disabled_at_null: 'false',
    viewTitle: 'Disabled'
  }
}
