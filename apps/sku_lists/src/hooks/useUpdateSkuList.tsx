import { useCoreSdkProvider } from "@commercelayer/app-elements"
import { useCallback, useState } from "react"
import type { SkuListFormValues } from "#components/SkuListForm"
import { adaptFormValuesToSkuListUpdate } from "#components/SkuListForm/utils"

interface UpdateSkuListHook {
  updateSkuListError?: any
  updateSkuList: (formValues: SkuListFormValues) => Promise<void>
}

export function useUpdateSkuList(): UpdateSkuListHook {
  const { sdkClient } = useCoreSdkProvider()

  const [updateSkuListError, setUpdateSkuListError] =
    useState<UpdateSkuListHook["updateSkuListError"]>()

  const updateSkuList = useCallback<UpdateSkuListHook["updateSkuList"]>(
    async (formValues) => {
      setUpdateSkuListError(undefined)

      try {
        const skuList = adaptFormValuesToSkuListUpdate(formValues)
        await sdkClient.sku_lists.update(skuList)
      } catch (err) {
        setUpdateSkuListError(err)
      }
    },
    [],
  )

  return {
    updateSkuListError,
    updateSkuList,
  }
}
