import {
  ListDetailsItem,
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
          <ListDetailsItem label='Topic' gutter='none'>
            <Text>{webhook.topic}</Text>
          </ListDetailsItem>
        ) : null}
        {webhook.include_resources != null &&
        webhook.include_resources.length > 0 ? (
          <ListDetailsItem label='Includes' gutter='none'>
            <Text>{webhook.include_resources.join(', ')}</Text>
          </ListDetailsItem>
        ) : null}
      </Section>
    )
  }
)
