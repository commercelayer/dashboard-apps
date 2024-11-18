/* eslint-disable @typescript-eslint/promise-function-async */

import type { TokenProviderAuthUser } from '@commercelayer/app-elements/dist/providers/TokenProvider/types'
import { isAdmin } from './userUtils'

export const getExcludedPriceList = (
  user: TokenProviderAuthUser | null,
  testUsers: string | undefined
): string[] => {
  if (isAdmin(user, testUsers)) {
    return []
  }

  return ['AlnOyCKnXL', 'YkXQaCbmxl']
}
