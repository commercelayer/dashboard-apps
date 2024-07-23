import type { getWebhookTriggerActionName } from '#data/dictionaries'
import {
  useWebhookDetails,
  webhookIncludeAttribute
} from '#hooks/useWebhookDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

type UITriggerAttributes = Parameters<typeof getWebhookTriggerActionName>[0]

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (triggerAttribute: UITriggerAttributes) => Promise<void>
}

export function useTriggerAttribute(webhookId: string): TriggerAttributeHook {
  const { mutateWebhook } = useWebhookDetails(webhookId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        const updatedWebhook = await sdkClient.webhooks.update(
          {
            id: webhookId,
            [triggerAttribute]: true
          },
          {
            include: webhookIncludeAttribute
          }
        )
        void mutateWebhook(updatedWebhook)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this webhook']
        )
      } finally {
        setIsLoading(false)
      }
    },
    [webhookId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
