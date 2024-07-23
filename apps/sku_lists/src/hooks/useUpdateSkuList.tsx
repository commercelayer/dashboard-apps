import type { SkuListFormValues } from '#components/SkuListForm'
import {
  adaptFormListItemToSkuListItemCreate,
  adaptFormValuesToSkuListUpdate
} from '#components/SkuListForm/utils'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { useCallback, useState } from 'react'

interface UpdateSkuListHook {
  isUpdatingSkuList: boolean
  updateSkuListError?: any
  updateSkuList: (formValues: SkuListFormValues) => Promise<void>
}

export function useUpdateSkuList(): UpdateSkuListHook {
  const { sdkClient } = useCoreSdkProvider()

  const [isUpdatingSkuList, setIsUpdatingSkuList] = useState(false)
  const [updateSkuListError, setUpdateSkuListError] =
    useState<UpdateSkuListHook['updateSkuListError']>()

  const updateSkuList = useCallback<UpdateSkuListHook['updateSkuList']>(
    async (formValues) => {
      setIsUpdatingSkuList(true)
      setUpdateSkuListError(undefined)

      try {
        const skuList = adaptFormValuesToSkuListUpdate(formValues)
        const updatedSkuList = await sdkClient.sku_lists.update(skuList)
        const skuListItems = await sdkClient.sku_lists.sku_list_items(
          skuList.id,
          { include: ['sku'] }
        )
        // SKU list resource is updated. Now it's time to update related SKU list items.
        if (formValues.manual && updatedSkuList.id != null) {
          // Create or update items
          await Promise.all(
            formValues.items.map(async (item) => {
              const itemToUpdate = skuListItems?.find(
                (skuListItem) =>
                  skuListItem.sku_code === item.sku_code &&
                  skuListItem.quantity !== item.quantity
              )
              // Item needs to be updated. Item exists but quantity needs to be updated.
              if (itemToUpdate != null) {
                await sdkClient.sku_list_items.update({
                  id: itemToUpdate.id,
                  quantity: item.quantity,
                  position: item.position
                })
              }
              const isExistingItem = Boolean(
                skuListItems?.some(
                  (skuListItem) => skuListItem.sku_code === item.sku_code
                )
              )
              // Item needs to be created.
              if (!isExistingItem) {
                const skuListItem = adaptFormListItemToSkuListItemCreate(
                  item,
                  updatedSkuList.id,
                  sdkClient
                )
                await sdkClient.sku_list_items.create(skuListItem)
              }
            })
          )
          // Check if any of the old items needs to be removed
          if (skuListItems != null) {
            await Promise.all(
              skuListItems?.map(async (oldItem) => {
                const itemIsInFormItems = Boolean(
                  formValues.items.some(
                    (item) => item.sku_code === oldItem.sku_code
                  )
                )
                if (!itemIsInFormItems) {
                  await sdkClient.sku_list_items.delete(oldItem.id)
                }
              })
            )
          }
        }
      } catch (err) {
        setUpdateSkuListError(err)
      } finally {
        setIsUpdatingSkuList(false)
      }
    },
    []
  )

  return {
    isUpdatingSkuList,
    updateSkuListError,
    updateSkuList
  }
}
