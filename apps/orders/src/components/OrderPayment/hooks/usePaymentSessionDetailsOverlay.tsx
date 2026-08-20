import {
  Card,
  CodeBlock,
  formatDate,
  Spacer,
  Text,
  useResourceDetailsModal,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type {
  PaymentSession,
  PaymentTransaction,
  Resource,
} from "@commercelayer/sdk"
import { useState } from "react"
import type { JsonObject } from "type-fest"

interface Props {
  session: PaymentSession
}

/**
 * Payment session details, shown in a modal.
 *
 * Attributes and the event timeline come from `ResourceDetailsContent`, which
 * is shared with the dashboard. Only the Transactions tab is specific to
 * payments, so it is passed in through `tabs`.
 */
export function usePaymentSessionDetailsOverlay({ session }: Props) {
  const { modal, open, close } = useResourceDetailsModal({
    title: "Payment details",
    // The session is already loaded, with its transactions sideloaded, so
    // nothing is refetched here.
    resource: session as Resource,
    tabs: [
      {
        name: "Transactions",
        content: () => <TransactionsTab session={session} />,
      },
    ],
  })

  return { overlay: modal, open, close }
}

function TransactionsTab({ session }: { session: PaymentSession }) {
  const { user } = useTokenProvider()
  const transactions = session.payment_transactions ?? []

  if (transactions.length === 0) {
    return <Text variant="info">No transactions yet.</Text>
  }

  const kindsById = getTransactionKindsById(session)

  return (
    <div>
      {[...transactions]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            kind={kindsById.get(transaction.id)}
            timezone={user?.timezone}
          />
        ))}
    </div>
  )
}

/**
 * Maps each transaction id to what kind of transaction it actually is.
 *
 * Needed because entries inside `payment_transactions` come back with the
 * generic `type: "payment_transactions"` rather than the specific
 * `payment_captures`/`payment_authorizations`/... value. The specific types
 * exist in the union, but the API doesn't use them in this relationship. The
 * session's own typed relationships do carry the distinction, and they
 * reference the very same records by id, so we recover the kind from there.
 */
function getTransactionKindsById(session: PaymentSession): Map<string, string> {
  const kinds = new Map<string, string>()

  if (session.payment_authorization != null) {
    kinds.set(session.payment_authorization.id, "authorization")
  }
  if (session.payment_void != null) {
    kinds.set(session.payment_void.id, "void")
  }
  session.payment_captures?.forEach((capture) => {
    kinds.set(capture.id, "capture")
  })
  session.payment_refunds?.forEach((refund) => {
    kinds.set(refund.id, "refund")
  })

  return kinds
}

function TransactionItem({
  transaction,
  kind,
  timezone,
}: {
  transaction: PaymentTransaction
  kind: string | undefined
  timezone?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const reason =
    typeof transaction.options?.cancellation_reason === "string"
      ? transaction.options.cancellation_reason
      : undefined

  return (
    <Spacer bottom="2">
      <Card
        gap="none"
        className={`w-full rounded! ${isOpen ? "border-black!" : ""}`}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm gap-8 select-none p-4"
          onClick={() => {
            setIsOpen((prev) => !prev)
          }}
        >
          <div className="flex items-baseline gap-1">
            <Text weight="bold">{transaction.formatted_amount}</Text>
            <Text variant="info">
              {kind ?? getTransactionKindLabel(transaction.type)}{" "}
              {transaction.status}
              {reason != null && ` — ${reason}`}
            </Text>
          </div>
          <Text variant="info">
            {formatDate({
              isoDate: transaction.created_at,
              format: "timeWithSeconds",
              timezone,
            })}
          </Text>
        </button>
        {isOpen && (
          <div className="mx-4 mb-4" style={{ cursor: "auto" }}>
            <CodeBlock>{transaction as unknown as JsonObject}</CodeBlock>
          </div>
        )}
      </Card>
    </Spacer>
  )
}

/**
 * Fallback for when a transaction isn't referenced by any of the session's
 * typed relationships. `PaymentTransactionType` does allow the specific
 * values, so honour them if they ever show up; otherwise stay vague rather
 * than guessing.
 */
function getTransactionKindLabel(type: PaymentTransaction["type"]): string {
  switch (type) {
    case "payment_authorizations":
      return "authorization"
    case "payment_captures":
      return "capture"
    case "payment_refunds":
      return "refund"
    case "payment_voids":
      return "void"
    default:
      return "transaction"
  }
}
