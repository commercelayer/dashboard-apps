import {
  Badge,
  type BadgeProps,
  Card,
  ListItem,
  ResourcePaymentMethod,
  Section,
  Text,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type {
  OrderSubscription,
  PaymentSetting,
  PaymentWallet,
} from "@commercelayer/sdk"
import {
  getPaymentSettingDisplay,
  getPaymentWalletDisplay,
  type PaymentSettingType,
} from "dashboard-apps-common/src/helpers/paymentDisplay"

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionPayment = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    const content =
      subscription.payment_wallet != null ? (
        <PaymentWalletRow wallet={subscription.payment_wallet} />
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

interface PaymentWalletRowProps {
  wallet: PaymentWallet
}

/** The wallet each renewal is charged to. */
function PaymentWalletRow({
  wallet,
}: PaymentWalletRowProps): React.JSX.Element {
  const {
    logoSrc,
    label,
    last4,
    settingLabel: gateway,
  } = getPaymentWalletDisplay(wallet)
  const expiry = getFormattedExpiry(wallet.expires_at)

  return (
    <Card backgroundColor="light" overflow="visible">
      <ListItem
        padding="none"
        borderStyle="none"
        icon={
          // Decorative: the brand name is already rendered as text beside it.
          <img src={logoSrc} alt="" className="h-8 w-auto" />
        }
      >
        <div>
          <div className="flex items-center gap-2">
            <Text weight="bold">
              {label}
              {last4 != null && <span className="font-normal"> ··{last4}</span>}
            </Text>
            {/* Only when renewals will not charge: canceled, or waiting on the customer. */}
            {wallet.status !== "succeeded" && (
              <Badge variant={getWalletBadgeVariant(wallet.status)}>
                {wallet.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          {(gateway != null || expiry != null) && (
            <Text variant="info" size="small">
              {[gateway, expiry].filter((part) => part != null).join(" · ")}
            </Text>
          )}
        </div>
      </ListItem>
    </Card>
  )
}

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

function getWalletBadgeVariant(
  status: PaymentWallet["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "succeeded":
      return "success"
    case "canceled":
      // Nothing can be charged against it any more, unlike the transient ones.
      return "danger"
    default:
      return "warning"
  }
}

/** The card's expiry as MM/YY, read in UTC so a local timezone cannot shift the month. */
function getFormattedExpiry(
  expiresAt: string | null | undefined,
): string | undefined {
  if (expiresAt == null) {
    return undefined
  }

  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  return `expires ${month}/${`${date.getUTCFullYear()}`.slice(-2)}`
}
