import {
  type CurrencyCode,
  formatCentsToCurrency,
  parseApiError,
} from "@commercelayer/app-elements"
import type { PaymentTransaction } from "@commercelayer/sdk"
import { useState } from "react"
import type { PaymentActionStep } from "#components/OrderPayment/PaymentActionModal"

export type PaymentActionOutcome = "success" | "pending" | "error"

/**
 * How long to wait before reading the outcome, matched to the row's polling
 * interval. One read, no loop: if the gateway has not settled by then the
 * modal says so and the row picks the result up on its next refresh.
 */
const WAIT_MS = 5000

/** Statuses a transaction can no longer move away from. */
const SETTLED_STATUSES: Array<PaymentTransaction["status"]> = [
  "succeeded",
  "declined",
  "failed",
  "canceled",
  "expired",
]

interface Props<T> {
  /**
   * Creates the transaction, or several of them: an order-level capture is one
   * capture per funding session. Returns them so their outcome can be read
   * back. Receives whatever `run` was called with, so form values reach it
   * without a round trip through state.
   */
  create: (input: T) => Promise<PaymentTransaction | PaymentTransaction[]>
  /** Re-reads one of the created transactions, typed to its own resource. */
  retrieve: (id: string) => Promise<PaymentTransaction>
  /** Called once the action settled, to refresh the order. */
  onSettled: () => void
  /**
   * Needed only to total several transactions into one amount. With a single
   * transaction its own `formatted_amount` is used.
   */
  currencyCode?: string | null
}

interface PaymentActionFlowHook<T> {
  step: PaymentActionStep
  errorDetail: string | undefined
  /**
   * Amount that actually moved, taken from the transaction we created.
   *
   * Read from there rather than from a balance on the authorization: those
   * balances describe what is *left*, so `formatted_void_balance` is `$0.00`
   * once the void succeeds and `formatted_capture_balance` is `$0.00` once
   * the capture does.
   */
  amount: string | undefined
  run: (input: T) => Promise<void>
  reset: () => void
}

/**
 * Drives one payment action through the modal's steps.
 *
 * The write is asynchronous end to end: the API returns a `pending`
 * transaction and a worker performs the gateway call, so the only honest way
 * to report an outcome is to read the transaction back afterwards.
 */
export function usePaymentActionFlow<T = void>({
  create,
  retrieve,
  onSettled,
  currencyCode,
}: Props<T>): PaymentActionFlowHook<T> {
  const [step, setStep] = useState<PaymentActionStep>("confirm")
  const [errorDetail, setErrorDetail] = useState<string>()
  const [amount, setAmount] = useState<string>()

  return {
    step,
    errorDetail,
    amount,
    reset: () => {
      setStep("confirm")
      setErrorDetail(undefined)
      setAmount(undefined)
    },
    run: async (input) => {
      setStep("running")
      setErrorDetail(undefined)
      setAmount(undefined)

      let transactions: PaymentTransaction[]
      try {
        const created = await create(input)
        transactions = Array.isArray(created) ? created : [created]
      } catch (error) {
        // A rejected request never reached the gateway, so the API's own
        // message is the most useful thing we can show.
        setErrorDetail(parseApiError(error)[0]?.detail)
        setStep("error")
        return
      }

      setAmount(getAmount(transactions, currencyCode))

      await new Promise((resolve) => setTimeout(resolve, WAIT_MS))

      let outcome: PaymentActionOutcome
      try {
        const settled = await Promise.all(
          transactions.map(async ({ id }) => await retrieve(id)),
        )
        outcome = getCombinedOutcome(settled.map(({ status }) => status))
      } catch {
        // The action itself was accepted, so a failed read is not a failed
        // action: report it as unsettled rather than as an error.
        outcome = "pending"
      }

      setStep(outcome)
      // Also on `pending` and `error`: a declined transaction still belongs in
      // the row's history, and the status may have moved either way.
      onSettled()
    },
  }
}

function getOutcome(
  status: PaymentTransaction["status"],
): PaymentActionOutcome {
  if (status === "succeeded") {
    return "success"
  }

  return SETTLED_STATUSES.includes(status) ? "error" : "pending"
}

/**
 * With several transactions the worst outcome wins, so a partly failed
 * order-level capture is never reported as a success.
 */
function getCombinedOutcome(
  statuses: Array<PaymentTransaction["status"]>,
): PaymentActionOutcome {
  const outcomes = statuses.map(getOutcome)

  if (outcomes.includes("error")) {
    return "error"
  }

  return outcomes.includes("pending") ? "pending" : "success"
}

function getAmount(
  transactions: PaymentTransaction[],
  currencyCode: string | null | undefined,
): string | undefined {
  if (transactions.length === 1) {
    return transactions[0]?.formatted_amount ?? undefined
  }

  if (currencyCode == null) {
    return undefined
  }

  return formatCentsToCurrency(
    transactions.reduce(
      (total, { amount_cents }) => total + (amount_cents ?? 0),
      0,
    ),
    currencyCode as Uppercase<CurrencyCode>,
  )
}
