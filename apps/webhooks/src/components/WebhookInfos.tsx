import {
  Card,
  ListDetailsItem,
  Text,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Webhook } from "@commercelayer/sdk"

interface WebhookInfosProps {
  webhook: Webhook
}

/**
 * What the webhook is subscribed to and where it posts, as label/value rows.
 *
 * Values are monospaced and right-aligned: they are API identifiers and a URL, read
 * character by character rather than as prose.
 */
export const WebhookInfos = withSkeletonTemplate<WebhookInfosProps>(
  ({ webhook }) => {
    const includes = webhook.include_resources ?? []

    return (
      <Card gap="none">
        <ListDetailsItem label="Topic" childrenAlign="right">
          <Text weight="semibold" className="font-mono">
            {webhook.topic}
          </Text>
        </ListDetailsItem>
        {includes.length > 0 && (
          <ListDetailsItem label="Includes" childrenAlign="right">
            <Text weight="semibold" className="font-mono">
              {includes.join(", ")}
            </Text>
          </ListDetailsItem>
        )}
        <ListDetailsItem
          label="Callback URL"
          childrenAlign="right"
          border="none"
        >
          <Text weight="semibold" className="font-mono">
            {webhook.callback_url}
          </Text>
        </ListDetailsItem>
      </Card>
    )
  },
)
