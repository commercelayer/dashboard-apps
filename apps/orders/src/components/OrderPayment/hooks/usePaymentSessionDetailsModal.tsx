import {
  Card,
  CodeBlock,
  formatDate,
  Spacer,
  Text,
  useResourceDetailsModal,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentSession, PaymentTransaction } from "@commercelayer/sdk"
import { useState } from "react"
import type { JsonObject } from "type-fest"

interface Props {
  session: PaymentSession
}

/** A payment session's details in a modal: attributes, events and a Transactions tab. */
export function usePaymentSessionDetailsModal({ session }: Props) {
  const { modal, open } = useResourceDetailsModal({
    title: "Payment details",
    resource: session,
    tabs: [
      {
        name: "Transactions",
        content: () => <TransactionsTab session={session} />,
      },
    ],
  })

  return { modal, open }
}

function TransactionsTab({ session }: { session: PaymentSession }) {
  const { user } = useTokenProvider()
  const transactions = session.payment_transactions ?? []

  if (transactions.length === 0) {
    return <Text variant="info">No transactions yet.</Text>
  }

  const typesById = getTransactionTypesById(session)

  return (
    <div>
      {[...transactions]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            type={typesById.get(transaction.id) ?? transaction.type}
            timezone={user?.timezone}
          />
        ))}
    </div>
  )
}

/**
 * Maps each transaction id to its specific type. Entries in
 * `payment_transactions` are all typed `payment_transactions`, so the type
 * comes from the session's own relationships.
 */
function getTransactionTypesById(
  session: PaymentSession,
): Map<string, PaymentTransaction["type"]> {
  const types = new Map<string, PaymentTransaction["type"]>()

  if (session.payment_authorization != null) {
    types.set(session.payment_authorization.id, "payment_authorizations")
  }
  if (session.payment_void != null) {
    types.set(session.payment_void.id, "payment_voids")
  }
  session.payment_captures?.forEach((capture) => {
    types.set(capture.id, "payment_captures")
  })
  session.payment_refunds?.forEach((refund) => {
    types.set(refund.id, "payment_refunds")
  })

  return types
}

function TransactionItem({
  transaction,
  type,
  timezone,
}: {
  transaction: PaymentTransaction
  type: PaymentTransaction["type"]
  timezone?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  // @ts-expect-error: `CodeBlock` takes a `JsonObject`, whose values cannot be
  // `undefined`, while every optional field on an SDK resource can be. What
  // arrives over the wire is plain JSON either way.
  const transactionJson: JsonObject = transaction
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
              {getTransactionTypeLabel(type)} {transaction.status}
              {reason != null && ` · ${reason}`}
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
            <CodeBlock>{transactionJson}</CodeBlock>
          </div>
        )}
      </Card>
    </Spacer>
  )
}

/** The word shown for a transaction type, e.g. "capture". */
function getTransactionTypeLabel(type: PaymentTransaction["type"]): string {
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
