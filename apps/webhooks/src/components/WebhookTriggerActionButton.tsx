import {
  getWebhookTriggerAction,
  getWebhookTriggerActionName
} from '#data/dictionaries'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import { Button, withSkeletonTemplate } from '@commercelayer/app-elements'
import type { Webhook } from '@commercelayer/sdk'

interface WebhookTriggerActionButtonProps {
  webhook: Webhook
}

export const WebhookTriggerActionButton =
  withSkeletonTemplate<WebhookTriggerActionButtonProps>(({ webhook }) => {
    const triggerAction = getWebhookTriggerAction(webhook)
    const label = getWebhookTriggerActionName(triggerAction.triggerAttribute)
    const { isLoading, dispatch } = useTriggerAttribute(webhook.id)

    return (
      <Button
        disabled={isLoading}
        size='small'
        variant='primary'
        onClick={() => {
          void dispatch(triggerAction.triggerAttribute)
        }}
        style={{
          alignSelf: 'baseline'
        }}
      >
        {label}
      </Button>
    )
  })
