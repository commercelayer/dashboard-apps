/* eslint-disable @typescript-eslint/promise-function-async */

import { isAdmin } from './userUtils'

export const getExcludedPriceList = (): any[] => {
  if (isAdmin()) {
    return []
  }

  return ['AlnOyCKnXL', 'YkXQaCbmxl']
}
