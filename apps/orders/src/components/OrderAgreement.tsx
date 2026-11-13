import {
  Card,
  Section,
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
 * B2B: the agreement the order was placed under, its name and code, in the
 * light card the agent and the customer have above it.
 */
export const OrderAgreement = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element | null => {
    const { t } = useTranslation()
    const agreement = order.agreement

    if (agreement?.name == null) {
      return null
    }

    return (
      <Section title={t("apps.orders.details.agreement")}>
        <Card
          backgroundColor="light"
          gap="4"
          overflow="visible"
          className="mt-4"
        >
          <div className="flex items-center gap-4">
            {/* 36px, the customer avatar's size: `large` with 8px around the icon */}
            <StatusIcon
              name="fileText"
              background="black"
              gap="large"
              className="p-2!"
            />
            {/* `min-w-0`, or a long name would widen the card instead of being truncated */}
            <div className="min-w-0">
              <Text
                tag="div"
                weight="semibold"
                size="small"
                className="truncate"
              >
                {agreement.name}
              </Text>
              {agreement.code != null && (
                <Text
                  size="x-small"
                  tag="div"
                  variant="info"
                  weight="regular"
                  className="truncate"
                >
                  {agreement.code}
                </Text>
              )}
            </div>
          </div>
        </Card>
      </Section>
    )
  },
)
