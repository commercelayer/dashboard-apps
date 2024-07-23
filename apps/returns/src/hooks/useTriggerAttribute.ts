import type { getReturnTriggerAttributeName } from '#data/dictionaries'
import {
  returnIncludeAttribute,
  useReturnDetails
} from '#hooks/useReturnDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

type UITriggerAttributes = Parameters<typeof getReturnTriggerAttributeName>[0]

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (triggerAttribute: UITriggerAttributes) => Promise<void>
}

export function useTriggerAttribute(returnId: string): TriggerAttributeHook {
  const { mutateReturn } = useReturnDetails(returnId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        const updatedReturn = await sdkClient.returns.update(
          {
            id: returnId,
            [triggerAttribute]: true
          },
          {
            include: returnIncludeAttribute
          }
        )
        void mutateReturn(updatedReturn)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this return']
        )
      } finally {
        setIsLoading(false)
      }
    },
    [returnId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
