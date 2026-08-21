import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import { useMemo } from "react"
import { makeWebhook } from "#mocks"

interface UseWebhookDetailsOptions {
  /**
   * Fetch the `last_event_callbacks` relationship as a separate paginated
   * request and expose it on the returned webhook.
   *
   * It is not included in the `retrieve` call because webhooks with a large
   * number of event callbacks can make the API request time out.
   */
  withLastEventCallbacks?: boolean
}

export function useWebhookDetails(
  id: string,
  { withLastEventCallbacks = false }: UseWebhookDetailsOptions = {},
) {
  const isSkipped = isMockedId(id)

  const {
    data: webhookData,
    isLoading,
    mutate: mutateWebhookData,
    isValidating,
    error,
  } = useCoreApi("webhooks", "retrieve", isSkipped ? null : [id], {
    fallbackData: makeWebhook(),
  })

  const {
    data: lastEventCallbacks,
    isLoading: isLoadingLastEventCallbacks,
    mutate: mutateLastEventCallbacks,
  } = useCoreApi(
    "webhooks",
    "last_event_callbacks",
    isSkipped || !withLastEventCallbacks ? null : [id, { pageSize: 10 }],
  )

  const webhook = useMemo(
    () =>
      withLastEventCallbacks
        ? { ...webhookData, last_event_callbacks: lastEventCallbacks ?? [] }
        : webhookData,
    [webhookData, lastEventCallbacks, withLastEventCallbacks],
  )

  const mutateWebhook: typeof mutateWebhookData = async (...args) => {
    const [updatedWebhook] = await Promise.all([
      mutateWebhookData(...args),
      mutateLastEventCallbacks(),
    ])
    return updatedWebhook
  }

  return {
    webhook,
    isLoading: isLoading || isLoadingLastEventCallbacks,
    mutateWebhook,
    isValidating,
    error,
  }
}
