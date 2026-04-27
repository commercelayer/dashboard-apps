import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import { makeWebhook } from "#mocks"

export const webhookIncludeAttribute = ["last_event_callbacks"]

export function useWebhookDetails(id: string) {
  const {
    data: webhook,
    isLoading,
    mutate: mutateWebhook,
    isValidating,
  } = useCoreApi(
    "webhooks",
    "retrieve",
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: webhookIncludeAttribute,
          },
        ],
    {
      fallbackData: makeWebhook(),
    },
  )

  return { webhook, isLoading, mutateWebhook, isValidating }
}
