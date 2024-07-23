import { isMockedId, makeWebhook } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'

export const webhookIncludeAttribute = ['last_event_callbacks']

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useWebhookDetails(id: string) {
  const {
    data: webhook,
    isLoading,
    mutate: mutateWebhook,
    isValidating
  } = useCoreApi(
    'webhooks',
    'retrieve',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: webhookIncludeAttribute
          }
        ],
    {
      fallbackData: makeWebhook()
    }
  )

  return { webhook, isLoading, mutateWebhook, isValidating }
}
