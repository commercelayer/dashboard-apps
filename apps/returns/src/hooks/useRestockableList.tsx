import { isMockedId } from '#mocks'
import type { Return, ReturnLineItem } from '@commercelayer/sdk'
import { useMemo } from 'react'

export function useRestockableList(returnObj: Return): ReturnLineItem[] {
  const restockableList = useMemo(() => {
    if (!isMockedId(returnObj.id)) {
      return returnObj.return_line_items?.filter(
        (lineItem) => lineItem.restocked_at == null
      )
    }
  }, [returnObj])
  return restockableList ?? []
}
