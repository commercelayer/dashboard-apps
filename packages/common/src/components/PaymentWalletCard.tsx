import {
  Badge,
  type BadgeProps,
  Card,
  ListItem,
  Text,
} from "@commercelayer/app-elements"
import type { PaymentWallet } from "@commercelayer/sdk"
import { getPaymentWalletDisplay } from "../helpers/paymentDisplay"

interface Props {
  wallet: PaymentWallet
  /** Rendered at the end of the row, e.g. a button to remove the wallet. */
  actionButton?: React.ReactNode
}

/** A stored payment method: card, gateway, expiry, and its status when it cannot be charged. */
export function PaymentWalletCard({
  wallet,
  actionButton,
}: Props): React.JSX.Element {
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
            {/* Only when the wallet cannot be charged: canceled, or waiting on the customer. */}
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
        {actionButton}
      </ListItem>
    </Card>
  )
}

/** `canceled` is final; the other statuses still wait on the customer or the gateway. */
function getWalletBadgeVariant(
  status: PaymentWallet["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "succeeded":
      return "success"
    case "canceled":
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
