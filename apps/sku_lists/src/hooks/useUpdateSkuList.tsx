import type { SkuListFormValues } from '#components/SkuListForm'
import { adaptFormValuesToSkuListUpdate } from '#components/SkuListForm/utils'
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
        await sdkClient.sku_lists.update(skuList)
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
