import type { FormFullValues } from '@commercelayer/app-elements'

export type ListType = 'all'

export const presets: Record<ListType, FormFullValues> = {
  all: {
    customerGroup: [],
    status: [],
    type: []
  }
}
