import {
  ResourceDetailsTimeline,
  ResourceDetailsTimelineItem,
  Text,
  useResourceDetailsModal,
} from "@commercelayer/app-elements"
import type { PaymentSession, PaymentTransaction } from "@commercelayer/sdk"
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

/** Grouped by day and styled like the Events tab next to it. */
function TransactionsTab({ session }: { session: PaymentSession }) {
  const transactions = session.payment_transactions ?? []

  if (transactions.length === 0) {
    return <Text variant="info">No transactions yet.</Text>
  }

  const typesById = getTransactionTypesById(session)

  return (
    <ResourceDetailsTimeline
      items={[...transactions].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      )}
      getDate={(transaction) => transaction.created_at}
      getKey={(transaction) => transaction.id}
      renderItem={(transaction) => (
        <TransactionItem
          transaction={transaction}
          type={typesById.get(transaction.id) ?? transaction.type}
        />
      )}
    />
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
}: {
  transaction: PaymentTransaction
  type: PaymentTransaction["type"]
}) {
  // @ts-expect-error: `CodeBlock` takes a `JsonObject`, whose values cannot be
  // `undefined`, while every optional field on an SDK resource can be. What
  // arrives over the wire is plain JSON either way.
  const transactionJson: JsonObject = transaction
  const reason =
    typeof transaction.options?.cancellation_reason === "string"
      ? transaction.options.cancellation_reason
      : undefined

  return (
    <ResourceDetailsTimelineItem
      title={transaction.formatted_amount}
      isoDate={transaction.created_at}
      description={
        <>
          {getTransactionTypeLabel(type)} {transaction.status}
          {reason != null && ` · ${reason}`}
        </>
      }
      code={transactionJson}
    />
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
