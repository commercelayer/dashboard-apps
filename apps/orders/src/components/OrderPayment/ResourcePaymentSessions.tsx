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
  Tooltip,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type {
  PaymentLink,
  PaymentSession,
  PaymentSetting,
} from "@commercelayer/sdk"
import {
  getPaymentSessionDisplay,
  getPaymentSettingDisplay,
} from "dashboard-apps-common/src/helpers/paymentDisplay"
import { usePaymentLinkActions } from "#components/OrderPayment/hooks/usePaymentLinkActions"
import { usePaymentLinkDetailsModal } from "#components/OrderPayment/hooks/usePaymentLinkDetailsModal"
import { usePaymentSessionActions } from "#components/OrderPayment/hooks/usePaymentSessionActions"
import { usePaymentSessionDetailsModal } from "#components/OrderPayment/hooks/usePaymentSessionDetailsModal"
import {
  getCapturedAmount,
  getPaymentSessionBadgeVariant,
  getPaymentSessionStatusName,
  getRefundedAmount,
} from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  /** The order the sessions belong to. */
  orderId: string
  sessions: PaymentSession[]
  /** Links not paid yet, with the setting they will be paid through. */
  links?: Array<{
    link: PaymentLink
    setting: PaymentSetting | undefined
  }>
  /** The link each session came from, by session id. */
  sessionPaymentLinks?: ReadonlyMap<string, PaymentLink>
  /** Rendered in the section header, e.g. the button that requests a payment. */
  actionButton?: React.ReactNode
  onChange: () => void
}

/** The order's payment sessions and open payment links, one row each. */
export function ResourcePaymentSessions({
  orderId,
  sessions,
  links = [],
  sessionPaymentLinks,
  actionButton,
  onChange,
}: Props) {
  // With a header action, the section shows even when empty.
  if (sessions.length === 0 && links.length === 0 && actionButton == null) {
    return null
  }

  /** Unpaid sessions a link created: the link's row stands in for them. */
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
                orderId={orderId}
                session={row.session}
                paymentLink={sessionPaymentLinks?.get(row.session.id)}
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

interface PaymentLinkRowProps {
  link: PaymentLink
  setting: PaymentSetting | undefined
  onChange: () => void
  isLast: boolean
}

/** A payment asked for through a link, not made yet. */
function PaymentLinkRow({
  link,
  setting,
  onChange,
  isLast,
}: PaymentLinkRowProps) {
  const { user } = useTokenProvider()
  const { dropdownItems, dialogs } = usePaymentLinkActions({ link, onChange })
  // The gateway: no instrument is chosen yet.
  const { logoSrc } = getPaymentSettingDisplay(setting?.type)

  return (
    <>
      <ListItem
        padding="y"
        borderStyle={isLast ? "none" : "dashed"}
        icon={
          <img src={logoSrc} alt={setting?.name ?? ""} className="h-8 w-auto" />
        }
      >
        <div>
          <div className="flex items-center gap-2">
            {/* An empty description comes back as "". */}
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
      {dialogs}
    </>
  )
}

/** `completed` never reaches this list: a paid link is shown as its session. */
function getPaymentLinkBadgeVariant(link: PaymentLink): BadgeProps["variant"] {
  return link.status === "open" ? "warning" : "secondary"
}

interface PaymentSessionRowProps {
  orderId: string
  session: PaymentSession
  paymentLink: PaymentLink | undefined
  onChange: () => void
  isLast: boolean
}

/** A session row, with the link's details when it came from a link. */
function PaymentSessionRow(props: PaymentSessionRowProps) {
  return props.paymentLink == null ? (
    <PaymentSessionRowContent {...props} />
  ) : (
    <LinkedPaymentSessionRow {...props} paymentLink={props.paymentLink} />
  )
}

function LinkedPaymentSessionRow({
  paymentLink,
  ...props
}: PaymentSessionRowProps & { paymentLink: PaymentLink }) {
  const { modal, open } = usePaymentLinkDetailsModal(paymentLink)

  return (
    <>
      <PaymentSessionRowContent
        {...props}
        paymentLink={paymentLink}
        onViewPaymentLink={open}
      />
      {modal}
    </>
  )
}

function PaymentSessionRowContent({
  orderId,
  session,
  paymentLink,
  onViewPaymentLink,
  onChange,
  isLast,
}: PaymentSessionRowProps & { onViewPaymentLink?: () => void }) {
  const { user } = useTokenProvider()
  const capturedAmount = getCapturedAmount(session)
  const refundedAmount = getRefundedAmount(session)
  const display = getPaymentSessionDisplay(session)
  const { logoSrc, label, last4 } = display
  const { modal: detailsModal, open: openDetails } =
    usePaymentSessionDetailsModal({ session })
  const { dropdownItems, dialogs } = usePaymentSessionActions({
    orderId,
    session,
    display,
    onViewPaymentLink,
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
            {paymentLink != null && (
              <Tooltip
                label={<Icon name="link" size={16} className="text-gray-500" />}
                content="Paid through a payment link."
              />
            )}
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
            {/* The session amount never changes; these lines show what actually moved. */}
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
      {detailsModal}
      {dialogs}
    </>
  )
}
