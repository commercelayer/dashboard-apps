import { getWebhookStatus, hasWebhookEverFired } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { makeWebhook } from '#mocks'
import { getWebhookPredicateByStatus } from '#utils/getWebhookPredicateByStatus'
import {
  Hint,
  Icon,
  ListItem,
  RadialProgress,
  StatusIcon,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Webhook } from '@commercelayer/sdk'
import type { FC } from 'react'
import { useLocation } from 'wouter'

/**
 * Get the relative status based on webhook's circuit state {@link https://docs.commercelayer.io/core/v/api-reference/webhooks/object}
 * @param webhook - The webhook object.
 * @returns a valid StatusUI to be used in the StatusIcon component.
 */
function getListUiIcon(webhook: Webhook): JSX.Element {
  const everFired = hasWebhookEverFired(webhook)
  const status = getWebhookStatus(webhook)
  if (!everFired && status !== 'disabled') {
    return <RadialProgress />
  }
  switch (status) {
    case 'active':
      return <StatusIcon name='pulse' gap='large' background='green' />

    case 'disabled':
      return <StatusIcon name='minus' gap='large' background='gray' />

    case 'failed':
      return <StatusIcon name='x' gap='large' background='red' />
  }
}

interface ListItemWebhookProps {
  resource?: Webhook
  isLoading?: boolean
  delayMs?: number
}

export const ListItemWebhook: FC<ListItemWebhookProps> = ({
  resource = makeWebhook()
}) => {
  const [, setLocation] = useLocation()
  const { user } = useTokenProvider()
  const webhookPredicate = getWebhookPredicateByStatus(resource, user?.timezone)

  return (
    <ListItem
      alignItems='center'
      icon={getListUiIcon(resource)}
      onClick={() => {
        setLocation(appRoutes.details.makePath({ webhookId: resource.id }))
      }}
    >
      <div>
        <Text weight='bold'>{resource.name}</Text>
        <Hint>
          {resource.topic} · {webhookPredicate}
        </Hint>
      </div>
      <Icon name='caretRight' />
    </ListItem>
  )
}
