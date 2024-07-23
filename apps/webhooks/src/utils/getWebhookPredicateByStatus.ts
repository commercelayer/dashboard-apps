import { getWebhookStatus, hasWebhookEverFired } from '#data/dictionaries'
import { formatDateWithPredicate } from '@commercelayer/app-elements'
import type { Webhook } from '@commercelayer/sdk'

/**
 * Determine the webhook predicate based on its app status. Eg. 'Last fired on Oct 30 · 08:55.'.
 * @param webhook a given webhook object
 * @returns a string that contain status based predicate with eventually the related date info.
 */
export function getWebhookPredicateByStatus(
  webhook: Webhook,
  timezone: string | undefined
): string {
  const everFired = hasWebhookEverFired(webhook)
  const status = getWebhookStatus(webhook)
  const lastEventCallback =
    webhook.last_event_callbacks?.slice(0, 1)[0] ?? undefined
  if (!everFired && status !== 'disabled') {
    return 'Never fired'
  }
  switch (status) {
    case 'disabled':
      return formatDateWithPredicate({
        predicate: 'Disabled',
        isoDate: webhook.disabled_at ?? '',
        timezone
      })
    case 'failed':
      return formatDateWithPredicate({
        predicate: 'Failed',
        isoDate: lastEventCallback?.created_at ?? '',
        timezone
      })
    case 'active':
      return formatDateWithPredicate({
        predicate: 'Last fired',
        isoDate: lastEventCallback?.created_at,
        timezone
      })
  }
}
