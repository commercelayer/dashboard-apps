import type { getStockTransferTriggerAttributeName } from '#data/dictionaries'
import {
  stockTransferIncludeAttribute,
  useStockTransferDetails
} from '#hooks/useStockTransferDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

type UITriggerAttributes = Parameters<
  typeof getStockTransferTriggerAttributeName
>[0]

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (triggerAttribute: UITriggerAttributes) => Promise<void>
}

export function useTriggerAttribute(
  stockTransferId: string
): TriggerAttributeHook {
  const { mutateStockTransfer } = useStockTransferDetails(stockTransferId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        const updatedStockTransfer = await sdkClient.stock_transfers.update(
          {
            id: stockTransferId,
            [triggerAttribute]: true
          },
          {
            include: stockTransferIncludeAttribute
          }
        )
        void mutateStockTransfer(updatedStockTransfer)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this stock transfer']
        )
      } finally {
        setIsLoading(false)
      }
    },
    [stockTransferId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
