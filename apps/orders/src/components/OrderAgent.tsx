import {
  A,
  ListItem,
  Section,
  Spacer,
  StatusIcon,
  Text,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"

interface Props {
  order: Order
}

/**
 * B2B: the email-to-order agent that built the order, and the email it built it
 * from — `#808`'s link to the email.
 *
 * Shown only when the agent came with the order: an app whose token cannot read
 * agents gets it as a bare link, with nothing to show.
 */
export const OrderAgent = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element | null => {
    const { t } = useTranslation()
    const agent = order.agent
    const email = order.inbound_message

    if (agent?.name == null) {
      return null
    }

    return (
      <Section title={t("apps.orders.details.agent")}>
        <ListItem
          icon={<StatusIcon name="robot" background="black" gap="large" />}
        >
          <div>
            <Text tag="div" weight="semibold">
              {agent.name}
            </Text>
            {agent.inbound_email != null && (
              <Text size="small" tag="div" variant="info" weight="medium">
                {agent.inbound_email}
              </Text>
            )}
          </div>
        </ListItem>
        {email != null && (
          <Spacer top="4">
            {email.subject != null && (
              <Text tag="div" weight="semibold">
                {email.subject}
              </Text>
            )}
            {email.from_address != null && (
              <Text size="small" tag="div" variant="info">
                {t("apps.orders.details.email_from", {
                  sender: email.from_address,
                })}
              </Text>
            )}
            {email.raw_payload_url != null && (
              <Spacer top="2">
                <A
                  href={email.raw_payload_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("apps.orders.details.download_email")}
                </A>
              </Spacer>
            )}
          </Spacer>
        )}
      </Section>
    )
  },
)
