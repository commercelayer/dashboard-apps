import {
  Card,
  ListItem,
  ResourcePaymentMethod,
  Section,
  Text,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { OrderSubscription, PaymentSetting } from "@commercelayer/sdk"
import { PaymentWalletCard } from "dashboard-apps-common/src/components/PaymentWalletCard"
import {
  getPaymentSettingDisplay,
  type PaymentSettingType,
} from "dashboard-apps-common/src/helpers/paymentDisplay"

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionPayment = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    const content =
      subscription.payment_wallet != null ? (
        <PaymentWalletCard wallet={subscription.payment_wallet} />
      ) : subscription.payment_setting != null ? (
        <PaymentSettingRow
          setting={subscription.payment_setting}
          gatewayType={getGatewayType(subscription)}
        />
      ) : subscription.customer_payment_source?.payment_source != null ? (
        <ResourcePaymentMethod
          // @ts-expect-error type mismatch for CustomerPaymentSource resource
          resource={subscription.customer_payment_source}
          showPaymentResponse
        />
      ) : null

    if (content == null) {
      return null
    }

    return (
      <Section title="Payment method" border="none">
        {content}
      </Section>
    )
  },
)

/** The setting's gateway type, from the source order's sessions: the subscription's copy has only the base type. */
function getGatewayType(
  subscription: OrderSubscription,
): PaymentSettingType | undefined {
  const settingId = subscription.payment_setting?.id

  return (subscription.source_order?.payment_sessions ?? []).find(
    ({ payment_setting: setting }) => setting?.id === settingId,
  )?.payment_setting?.type
}

interface PaymentSettingRowProps {
  setting: PaymentSetting
  gatewayType: PaymentSettingType | undefined
}

/** A setting without a wallet: its gateway cannot vault a card. */
function PaymentSettingRow({
  setting,
  gatewayType,
}: PaymentSettingRowProps): React.JSX.Element {
  const { logoSrc, label } = getPaymentSettingDisplay(gatewayType)

  return (
    <Card backgroundColor="light" overflow="visible">
      <ListItem
        padding="none"
        borderStyle="none"
        icon={
          // Decorative: the gateway name is already rendered as text beside it.
          <img src={logoSrc} alt="" className="h-8 w-auto" />
        }
      >
        <div>
          {/* The setting's name, or the fallback when the gateway is unknown. */}
          <Text tag="div" weight="bold">
            {label ?? setting.name}
          </Text>
          {label != null && (
            <Text tag="div" variant="info" size="small">
              {setting.name}
            </Text>
          )}
        </div>
      </ListItem>
    </Card>
  )
}
