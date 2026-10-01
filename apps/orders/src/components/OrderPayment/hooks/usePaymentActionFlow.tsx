import { parseApiError } from "@commercelayer/app-elements"
import type { PaymentTransaction } from "@commercelayer/sdk"
import { useState } from "react"

export type PaymentActionOutcome = "success" | "pending" | "error"

/** `confirm` is the caller's own first step; the rest are shared. */
export type PaymentActionStep = "confirm" | "running" | PaymentActionOutcome

/** How long to wait before reading the outcome back, once. */
const WAIT_MS = 5 * 1_000

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
   * Creates the transaction, or one per session for an order-level capture.
   * Receives whatever `run` was called with.
   */
  create: (input: T) => Promise<PaymentTransaction | PaymentTransaction[]>
  /** Re-reads one of the created transactions. */
  retrieve: (id: string) => Promise<PaymentTransaction>
  /** Called once the outcome is known, to refresh the order. */
  onSettled: () => void
}

interface PaymentActionFlowHook<T> {
  step: PaymentActionStep
  errorDetail: string | undefined
  /**
   * Amount that moved, from the created transaction. Not from a balance,
   * which reads zero once the action succeeds.
   */
  amount: string | undefined
  run: (input: T) => Promise<void>
  reset: () => void
}

/**
 * Runs a payment action through the modal's steps: create the transaction,
 * wait, then read its outcome back, since the gateway call happens after the
 * API has answered.
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

      let transactions: PaymentTransaction[]
      try {
        const created = await create(input)
        transactions = Array.isArray(created) ? created : [created]
      } catch (error) {
        // Refused before reaching the gateway: the API's message says why.
        setErrorDetail(parseApiError(error)[0]?.detail)
        setStep("error")
        return
      }

      // Several transactions have no single amount to show.
      setAmount(
        transactions.length === 1
          ? (transactions[0]?.formatted_amount ?? undefined)
          : undefined,
      )

      await new Promise((resolve) => setTimeout(resolve, WAIT_MS))

      let outcome: PaymentActionOutcome
      try {
        const settled = await Promise.all(
          transactions.map(async ({ id }) => await retrieve(id)),
        )
        outcome = getCombinedOutcome(settled.map(({ status }) => status))
      } catch {
        // The action was accepted, so a failed read means unknown, not failed.
        outcome = "pending"
      }

      setStep(outcome)
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

/** The worst outcome wins, so a partly failed capture is never a success. */
function getCombinedOutcome(
  statuses: Array<PaymentTransaction["status"]>,
): PaymentActionOutcome {
  const outcomes = statuses.map(getOutcome)

  if (outcomes.includes("error")) {
    return "error"
  }

  return outcomes.includes("pending") ? "pending" : "success"
}
