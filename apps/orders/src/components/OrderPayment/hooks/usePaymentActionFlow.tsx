import { parseApiError } from "@commercelayer/app-elements"
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
   * Creates the transaction. Returns it so its outcome can be read back.
   * Receives whatever `run` was called with, so form values reach it without
   * a round trip through state.
   */
  create: (input: T) => Promise<PaymentTransaction>
  /** Re-reads the same transaction, typed to its own resource. */
  retrieve: (id: string) => Promise<PaymentTransaction>
  /** Called once the action settled successfully, to refresh the order. */
  onSettled: () => void
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

      let transaction: PaymentTransaction
      try {
        transaction = await create(input)
      } catch (error) {
        // A rejected request never reached the gateway, so the API's own
        // message is the most useful thing we can show.
        setErrorDetail(parseApiError(error)[0]?.detail)
        setStep("error")
        return
      }

      setAmount(transaction.formatted_amount ?? undefined)

      await new Promise((resolve) => setTimeout(resolve, WAIT_MS))

      let outcome: PaymentActionOutcome
      try {
        const settled = await retrieve(transaction.id)
        outcome = getOutcome(settled.status)
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
