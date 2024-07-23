import { type ReturnFormValues } from '#components/FormReturn'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import type {
  CommerceLayerClient,
  Return,
  ReturnLineItem,
  StockLocation
} from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

interface CreateReturnLineItemsHook {
  isCreatingReturnLineItems: boolean
  createReturnLineItemsError?: any
  createReturnLineItems: (
    returnObj: Return,
    stockLocation: StockLocation,
    formValues: ReturnFormValues
  ) => Promise<void>
}

export function useCreateReturnLineItems(): CreateReturnLineItemsHook {
  const { sdkClient } = useCoreSdkProvider()

  const [isCreatingReturnLineItems, setIsCreatingReturnLineItems] =
    useState(false)
  const [createReturnLineItemsError, setCreateReturnLineItemsError] =
    useState<CreateReturnLineItemsHook['createReturnLineItemsError']>()

  const createReturnLineItems: CreateReturnLineItemsHook['createReturnLineItems'] =
    useCallback(async (returnObj, stockLocation, formValues) => {
      setIsCreatingReturnLineItems(true)
      setCreateReturnLineItemsError(undefined)
      const returnLineItems: ReturnLineItem[] = []

      try {
        await Promise.all(
          formValues.items.map(
            async (item) =>
              await sdkClient.return_line_items
                .create({
                  return: sdkClient.returns.relationship(returnObj?.id ?? null),
                  quantity: item.quantity,
                  line_item: sdkClient.line_items.relationship(item.value)
                })
                .then((lineItem) => returnLineItems.push(lineItem))
          )
        )
        await sdkClient.returns.update(
          {
            id: returnObj.id,
            stock_location: sdkClient.stock_locations.relationship(
              stockLocation.id
            ),
            _request: true
          },
          { include: ['stock_location'] }
        )
      } catch (err) {
        // delete line items and return if they were partially created
        if (returnLineItems?.length > 0) {
          await deleteReturnLineItems(returnLineItems, sdkClient)
          await sdkClient.returns.delete(returnObj.id)
        }
        setCreateReturnLineItemsError(err)
      } finally {
        setIsCreatingReturnLineItems(false)
      }
    }, [])

  return {
    isCreatingReturnLineItems,
    createReturnLineItemsError,
    createReturnLineItems
  }
}

async function deleteReturnLineItems(
  lineItems: ReturnLineItem[],
  sdkClient: CommerceLayerClient
): Promise<void> {
  await Promise.all(
    lineItems.map(async (item) => {
      await sdkClient.return_line_items.delete(item.id)
    })
  )
}
