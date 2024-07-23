import {
  ListItem,
  Section,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Webhook } from '@commercelayer/sdk'

interface WebhookInfosProps {
  webhook: Webhook
}

export const WebhookInfos = withSkeletonTemplate<WebhookInfosProps>(
  ({ webhook }) => {
    return (
      <Section title='Info'>
        {webhook.topic != null ? (
          <ListItem padding='y'>
            <Text variant='info'>Topic</Text>
            <Text weight='bold'>{webhook.topic}</Text>
          </ListItem>
        ) : null}
        {webhook.include_resources != null &&
        webhook.include_resources.length > 0 ? (
          <ListItem padding='y'>
            <Text variant='info'>Includes</Text>
            <Text weight='bold'>{webhook.include_resources.join(', ')}</Text>
          </ListItem>
        ) : null}
      </Section>
    )
  }
)
