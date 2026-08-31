import { useCoreSdkProvider } from "@commercelayer/app-elements"
import type { SkuList } from "@commercelayer/sdk"
import { useCallback, useState } from "react"
import type { SkuListFormValues } from "#components/SkuListForm"
import { adaptFormValuesToSkuListCreate } from "#components/SkuListForm/utils"

interface CreateSkuListHook {
  createSkuListError?: any
  createSkuList: (formValues: SkuListFormValues) => Promise<SkuList | undefined>
}

export function useCreateSkuList(): CreateSkuListHook {
  const { sdkClient } = useCoreSdkProvider()

  const [createSkuListError, setCreateSkuListError] =
    useState<CreateSkuListHook["createSkuListError"]>()

  const createSkuList: CreateSkuListHook["createSkuList"] = useCallback(
    async (formValues) => {
      setCreateSkuListError(undefined)

      const skuList = adaptFormValuesToSkuListCreate(formValues)
      try {
        const createdSkuList = await sdkClient.sku_lists.create(skuList)
        return createdSkuList
      } catch (err) {
        setCreateSkuListError(err)
      }
    },
    [],
  )

  return {
    createSkuListError,
    createSkuList,
  }
}
