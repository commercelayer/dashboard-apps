import type {
  BadgeProps,
  IconProps,
  TriggerAttribute
} from '@commercelayer/app-elements'
import type { DisplayStatus } from '@commercelayer/app-elements/dist/dictionaries/types'
import type { Webhook, WebhookUpdate } from '@commercelayer/sdk'

type ActionVariant = 'primary' | 'secondary'

interface TriggerAction {
  triggerAttribute: UITriggerAttributes
  variant?: ActionVariant
  hidden?: true
}

type WebhookAppStatus = 'disabled' | 'failed' | 'active'

/**
 * Determine if a webhook has ever fired by counting its `last_event_callbacks` relationship items
 * @param webhook a given webhook object
 * @returns a boolean flag
 */
export function hasWebhookEverFired(webhook: Webhook): boolean {
  if ((webhook.last_event_callbacks ?? []).length > 0) {
    return true
  }
  return false
}

/**
 * Determine the app level webhook status based on values of some its attributes
 * @param webhook a given webhook object
 * @returns a status string that can be disabled or failed or active
 */
export function getWebhookStatus(webhook: Webhook): WebhookAppStatus {
  if (webhook.disabled_at != null) {
    return 'disabled'
  } else if (webhook.circuit_state === 'open') {
    return 'failed'
  }
  return 'active'
}

type WebhookDisplayStatus = Pick<DisplayStatus, 'label'> & {
  variant: BadgeProps['variant']
}

export function getWebhookDisplayStatus(
  webhook: Webhook
): WebhookDisplayStatus {
  const status = getWebhookStatus(webhook)

  switch (status) {
    case 'active':
      return {
        label: 'active',
        variant: 'success'
      }
    case 'disabled':
      return {
        label: 'disabled',
        variant: 'secondary'
      }
    case 'failed':
      return {
        label: 'failed',
        variant: 'danger'
      }
  }
}

export function getWebhookBadgeIcon(webhook: Webhook): IconProps['name'] {
  const status = getWebhookStatus(webhook)
  switch (status) {
    case 'active':
      return 'pulse'
    case 'disabled':
      return 'minusCircle'
    case 'failed':
      return 'xCircle'
  }
}

export function getWebhookTriggerAction(webhook: Webhook): TriggerAction {
  const status = getWebhookStatus(webhook)

  switch (status) {
    case 'active':
      return { triggerAttribute: '_disable' }
    case 'disabled':
      return { triggerAttribute: '_enable' }
    case 'failed':
      return { triggerAttribute: '_reset_circuit' }
  }
}

type UITriggerAttributes = Extract<
  TriggerAttribute<WebhookUpdate>,
  '_enable' | '_disable' | '_reset_circuit'
>

export function getWebhookTriggerActionName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _enable: 'Enable',
    _disable: 'Disable',
    _reset_circuit: 'Reset'
  }

  return dictionary[triggerAttribute]
}
