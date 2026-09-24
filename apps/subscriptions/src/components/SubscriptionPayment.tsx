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
  getGatewayDisplay,
  getPaymentWalletDisplay,
  getWalletGatewayLabel,
} from "dashboard-apps-common/src/helpers/paymentDisplay"

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionPayment = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    // 2026-05+ subscriptions charge a stored wallet instead of a customer
    // payment source, so the two models render from different resources.
    if (subscription.payment_wallet != null) {
      return (
        <Section title="Payment method" border="none">
          <PaymentWalletRow wallet={subscription.payment_wallet} />
        </Section>
      )
    }

    // No wallet, but a setting: core records one instead of the other for a
    // gateway that cannot vault a card (`order_subscription.rb` validates the
    // setting as `non_vaultable`), so renewals here are collected by hand.
    if (subscription.payment_setting != null) {
      return (
        <Section title="Payment method" border="none">
          <PaymentSettingRow
            setting={subscription.payment_setting}
            gatewayType={getGatewayType(subscription)}
          />
        </Section>
      )
    }

    if (subscription.customer_payment_source?.payment_source == null) {
      return null
    }

    return (
      <Section title="Payment method" border="none">
        <ResourcePaymentMethod
          // @ts-expect-error type mismatch for CustomerPaymentSource resource
          resource={subscription.customer_payment_source}
          showPaymentResponse
        />
      </Section>
    )
  },
)

/**
 * The card every renewal will be charged, in the same single-row shape the
 * legacy `ResourcePaymentMethod` uses.
 */
function PaymentWalletRow({
  wallet,
}: {
  wallet: PaymentWallet
}): React.JSX.Element {
  const { logoSrc, label, last4 } = getPaymentWalletDisplay(wallet)
  const gateway = getWalletGatewayLabel(wallet)
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
            {/*
              Only worth saying when it is not the happy path: a wallet that is
              canceled, or still waiting on the customer, means the next
              renewal will not be charged.
            */}
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

/**
 * Which gateway the subscription's setting belongs to.
 *
 * Not `subscription.payment_setting.type`: behind an `order_subscription` core
 * serializes the base `payment_settings` type, where behind a
 * `payment_session` it serializes the STI subclass that names the gateway
 * (verified against the API, 2026-09). Both spellings of the same record
 * arrive in one response, so this matches them by id and keeps the useful one.
 * A setting that matches nothing, if someone repoints the subscription, leaves
 * the row on the setting's own name.
 */
function getGatewayType(subscription: OrderSubscription): string | undefined {
  const settingId = subscription.payment_setting?.id

  return (subscription.source_order?.payment_sessions ?? []).find(
    ({ payment_setting: setting }) => setting?.id === settingId,
  )?.payment_setting?.type
}

/**
 * A gateway with no instrument on file. Worth a row of its own rather than an
 * empty section: it is what tells the reader no renewal will charge itself.
 */
function PaymentSettingRow({
  setting,
  gatewayType,
}: {
  setting: PaymentSetting
  gatewayType: string | undefined
}): React.JSX.Element {
  const { logoSrc, label } = getGatewayDisplay(gatewayType)

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
          {/* The setting name is the merchant's own words, and the fallback
              until the retrieve above resolves the gateway. `tag` matters:
              `Text` renders a span by default, so two of them would share a
              line. */}
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

/**
 * `expires_at` is set by core from the card's own expiry month and year
 * (`payment_wallet.rb`, `set_expiration`), so it is read in UTC: a local
 * timezone could pull a card that expires on the 1st back into the month
 * before.
 */
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
