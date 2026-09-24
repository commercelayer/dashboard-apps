import {
  Badge,
  type BadgeProps,
  Card,
  Dropdown,
  formatDate,
  Icon,
  ListItem,
  Section,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentSession, PaymentSetting } from "@commercelayer/sdk"
import {
  getPaymentDisplay,
  getPaymentSettingDisplay,
} from "dashboard-apps-common/src/helpers/paymentDisplay"
import { usePaymentLinkActions } from "#components/OrderPayment/hooks/usePaymentLinkActions"
import { usePaymentSessionActions } from "#components/OrderPayment/hooks/usePaymentSessionActions"
import { usePaymentSessionDetailsOverlay } from "#components/OrderPayment/hooks/usePaymentSessionDetailsOverlay"
import {
  getCapturedAmount,
  getPaymentSessionBadgeVariant,
  getPaymentSessionStatusName,
  getRefundedAmount,
  type PaymentLinkWithAmount,
} from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  sessions: PaymentSession[]
  /**
   * Payments requested but not made yet, each with the gateway it will be paid
   * through: the link's own `payment_setting` is untyped, so the caller
   * resolves it (see `getPaymentLinkSetting`).
   */
  links?: Array<{
    link: PaymentLinkWithAmount
    setting: PaymentSetting | undefined
  }>
  /** Rendered in the section header, e.g. the button that requests a payment. */
  actionButton?: React.ReactNode
  onChange: () => void
}

/**
 * Renders the payment sessions of an order placed under API version
 * 2026-05+, where an order can be funded by multiple sessions (e.g. a gift
 * card plus a credit card), each independently authorized/captured/voided.
 */
export function ResourcePaymentSessions({
  sessions,
  links = [],
  actionButton,
  onChange,
}: Props) {
  // With an action in the header the section is worth showing empty: it is
  // where a first payment gets requested from.
  if (sessions.length === 0 && links.length === 0 && actionButton == null) {
    return null
  }

  /**
   * Sessions a link created for itself, which Adyen and Checkout.com need up
   * front. Two rows for one request reads as two payments, so the link stands
   * in for both: it carries the URL and the actions, and its session has
   * nothing of its own to say until someone pays it. Cancelling the link does
   * not release its session, so the rule covers every state a link can be in,
   * or a cancelled one would leave an unpaid row stranded. A session that has
   * been paid is never hidden, whatever its link says.
   */
  const sessionIdsShownAsLinks = new Set(
    links
      .filter(({ link }) => link.payment_session?.status === "unpaid")
      .map(({ link }) => link.payment_session?.id),
  )

  const rows = [
    ...sessions
      .filter((session) => !sessionIdsShownAsLinks.has(session.id))
      .map((session) => ({ key: session.id, session })),
    ...links.map(({ link, setting }) => ({ key: link.id, link, setting })),
  ]

  return (
    <Section title="Payments" border="none" actionButton={actionButton}>
      {rows.length === 0 ? (
        <Text variant="info">No payments.</Text>
      ) : (
        <Card
          backgroundColor="light"
          overflow="visible"
          gap="4"
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          {rows.map((row, index) =>
            "session" in row ? (
              <PaymentSessionRow
                key={row.key}
                session={row.session}
                onChange={onChange}
                isLast={index === rows.length - 1}
              />
            ) : (
              <PaymentLinkRow
                key={row.key}
                link={row.link}
                setting={row.setting}
                onChange={onChange}
                isLast={index === rows.length - 1}
              />
            ),
          )}
        </Card>
      )}
    </Section>
  )
}

/**
 * A payment that has been asked for but not made. What it collects is the
 * link's own amount: no session exists yet to carry it, and for Stripe none
 * will until the customer pays.
 */
function PaymentLinkRow({
  link,
  setting,
  onChange,
  isLast,
}: {
  link: PaymentLinkWithAmount
  setting: PaymentSetting | undefined
  onChange: () => void
  isLast: boolean
}) {
  const { user } = useTokenProvider()
  const { dropdownItems, overlay } = usePaymentLinkActions({ link, onChange })
  // The gateway that will take the payment. No card to show: the customer has
  // not chosen one yet, and may never.
  const { logoSrc } = getPaymentSettingDisplay(setting)

  return (
    <>
      <ListItem
        padding="y"
        borderStyle={isLast ? "none" : "dashed"}
        icon={
          // Decorative: the gateway is named in the row below when it has no
          // description of its own.
          <img src={logoSrc} alt="" className="h-8 w-auto" />
        }
      >
        <div>
          <div className="flex items-center gap-2">
            {/* The description is optional, and an empty one comes back as an
                empty string rather than as null. */}
            <Text weight="bold">
              {link.name == null || link.name === ""
                ? "Payment link"
                : link.name}
            </Text>
            <Badge variant={getPaymentLinkBadgeVariant(link)}>
              {link.status}
            </Badge>
          </div>
          <Text variant="info" size="small">
            {formatDate({
              format: "full",
              isoDate: link.created_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <Text weight="semibold">{link.formatted_amount}</Text>
          <Dropdown
            dropdownLabel={<Icon name="dotsThree" size="24" />}
            dropdownItems={dropdownItems}
          />
        </div>
      </ListItem>
      {overlay}
    </>
  )
}

function getPaymentLinkBadgeVariant(
  link: PaymentLinkWithAmount,
): BadgeProps["variant"] {
  // `completed` never reaches this list: a paid link is shown as its session.
  return link.status === "open" ? "warning" : "secondary"
}

function PaymentSessionRow({
  session,
  onChange,
  isLast,
}: {
  session: PaymentSession
  onChange: () => void
  isLast: boolean
}) {
  const { user } = useTokenProvider()
  const capturedAmount = getCapturedAmount(session)
  const refundedAmount = getRefundedAmount(session)
  const display = getPaymentDisplay(session)
  const { logoSrc, label, last4 } = display
  const { overlay: detailsOverlay, open: openDetails } =
    usePaymentSessionDetailsOverlay({ session })
  const { dropdownItems, Dialogs } = usePaymentSessionActions({
    session,
    display,
    onChange,
    onViewDetails: openDetails,
  })

  return (
    <>
      <ListItem
        padding="y"
        borderStyle={isLast ? "none" : "dashed"}
        icon={
          // Decorative: the brand name is already rendered as text below, so
          // an alt would make screen readers announce it twice.
          <img src={logoSrc} alt="" className="h-8 w-auto" />
        }
      >
        <div>
          <div className="flex items-center gap-2">
            <Text weight="bold">
              {label}
              {last4 != null && <span className="font-normal"> ··{last4}</span>}
            </Text>
            <Badge variant={getPaymentSessionBadgeVariant(session)}>
              {getPaymentSessionStatusName(session)}
            </Badge>
          </div>
          <Text variant="info" size="small">
            {formatDate({
              format: "full",
              isoDate: session.created_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Text tag="div" weight="semibold">
              {session.formatted_amount}
            </Text>
            {/*
              The amount above is what the session was created to collect, and
              nothing that happens afterwards changes it. These lines cover the
              cases where less than that actually moved.
            */}
            {capturedAmount != null && (
              <Text tag="div" variant="info" size="small">
                {capturedAmount} captured
              </Text>
            )}
            {refundedAmount != null && (
              <Text tag="div" variant="info" size="small">
                {refundedAmount} refunded
              </Text>
            )}
          </div>
          <Dropdown
            dropdownLabel={<Icon name="dotsThree" size="24" />}
            dropdownItems={dropdownItems}
          />
        </div>
      </ListItem>
      {detailsOverlay}
      {Dialogs}
    </>
  )
}
