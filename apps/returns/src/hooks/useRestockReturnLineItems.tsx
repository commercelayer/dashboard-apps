import { type RestockFormValues } from '#components/FormRestock'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

interface RestockReturnLineItemsHook {
  isRestockingReturnLineItems: boolean
  restockReturnLineItemsError?: any
  restockReturnLineItems: (
    returnObj: Return,
    formValues: RestockFormValues
  ) => Promise<void>
}

export function useRestockReturnLineItems(): RestockReturnLineItemsHook {
  const { sdkClient } = useCoreSdkProvider()

  const [isRestockingReturnLineItems, setIsRestockingReturnLineItems] =
    useState(false)
  const [restockReturnLineItemsError, setRestockReturnLineItemsError] =
    useState<RestockReturnLineItemsHook['restockReturnLineItemsError']>()

  const restockReturnLineItems: RestockReturnLineItemsHook['restockReturnLineItems'] =
    useCallback(async (returnObj, formValues) => {
      setIsRestockingReturnLineItems(true)
      setRestockReturnLineItemsError(undefined)
      const returnLineItemIds = formValues.items.map((item) => item.value)

      if (returnObj.return_line_items != null && returnLineItemIds.length > 0) {
        try {
          await Promise.all(
            returnObj.return_line_items.map(async (item) => {
              if (returnLineItemIds.includes(item.id)) {
                return await sdkClient.return_line_items.update({
                  id: item.id,
                  _restock: true
                })
              }
            })
          )
          await sdkClient.returns.update({
            id: returnObj.id,
            _request: true
          })
        } catch (err) {
          setRestockReturnLineItemsError(err)
        } finally {
          setIsRestockingReturnLineItems(false)
        }
      }
    }, [])

  return {
    isRestockingReturnLineItems,
    restockReturnLineItemsError,
    restockReturnLineItems
  }
}
