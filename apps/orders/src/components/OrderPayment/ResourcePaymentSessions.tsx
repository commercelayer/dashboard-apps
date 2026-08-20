import {
  Badge,
  Card,
  Dropdown,
  formatDate,
  Icon,
  ListItem,
  Section,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentSession } from "@commercelayer/sdk"
import { usePaymentSessionActions } from "#components/OrderPayment/hooks/usePaymentSessionActions"
import { usePaymentSessionDetailsOverlay } from "#components/OrderPayment/hooks/usePaymentSessionDetailsOverlay"
import { getPaymentDisplay } from "#components/OrderPayment/paymentDisplay"
import {
  getPaymentSessionBadgeVariant,
  getPaymentSessionStatusName,
  getRefundedAmount,
} from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  sessions: PaymentSession[]
  onChange: () => void
}

/**
 * Renders the payment sessions of an order placed under API version
 * 2026-05+, where an order can be funded by multiple sessions (e.g. a gift
 * card plus a credit card), each independently authorized/captured/voided.
 */
export function ResourcePaymentSessions({ sessions, onChange }: Props) {
  if (sessions.length === 0) {
    return null
  }

  return (
    <Section title="Payments" border="none">
      <Card
        backgroundColor="light"
        overflow="visible"
        gap="4"
        style={{ paddingTop: 0, paddingBottom: 0 }}
      >
        {sessions.map((session, index) => (
          <PaymentSessionRow
            key={session.id}
            session={session}
            onChange={onChange}
            isLast={index === sessions.length - 1}
          />
        ))}
      </Card>
    </Section>
  )
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
              nothing that happens afterwards changes it. This line covers the
              refund case, so the row says how much of it actually stuck.
            */}
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
