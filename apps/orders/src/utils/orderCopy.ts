import type { Order, OrderCopy } from "@commercelayer/sdk"
import capitalize from "lodash-es/capitalize"
import lowerCase from "lodash-es/lowerCase"

/**
 * Orders a seller would reorder: placed ones and those that followed. Drafts
 * and pending orders are still carts, with nothing worth copying yet.
 */
const duplicableStatuses: Array<Order["status"]> = [
  "placed",
  "approved",
  "cancelled",
]

/** Whether the order can be duplicated from its detail page. */
export function canDuplicateOrder(order: Pick<Order, "status">): boolean {
  return duplicableStatuses.includes(order.status)
}

/** How often the copy is checked while it runs in the background. */
export const ORDER_COPY_POLL_INTERVAL_MS = 1000

/** How long the copy may take before we stop waiting for it. */
export const ORDER_COPY_TIMEOUT_MS = 60_000

interface WaitForOrderCopyOptions {
  /** Reads the copy again, with its `target_order`. */
  retrieve: (id: string) => Promise<OrderCopy>
  messages: OrderCopyMessages
  intervalMs?: number
  timeoutMs?: number
}

interface OrderCopyMessages {
  /** Shown when Core aborts the copy, as one of the same order is already running. */
  aborted: string
  /** Shown when the copy failed without telling why. */
  failed: string
  /** Shown when the copy is still running after `timeoutMs`. */
  timeout: string
}

/**
 * Waits for an order copy to end, as Core runs it in the background, and
 * returns the new order. Throws with a readable message when it doesn't
 * complete, so the caller can show it.
 */
export async function waitForOrderCopy(
  orderCopy: OrderCopy,
  {
    retrieve,
    messages,
    intervalMs = ORDER_COPY_POLL_INTERVAL_MS,
    timeoutMs = ORDER_COPY_TIMEOUT_MS,
  }: WaitForOrderCopyOptions,
): Promise<Order> {
  const startedAt = Date.now()
  let current = orderCopy

  while (true) {
    const targetOrder = getCompletedTargetOrder(current, messages)
    if (targetOrder != null) {
      return targetOrder
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(messages.timeout)
    }

    await sleep(intervalMs)
    current = await retrieve(current.id)
  }
}

/**
 * The new order once the copy has completed, `null` while it is still running.
 * Throws when the copy has ended without one.
 */
function getCompletedTargetOrder(
  orderCopy: OrderCopy,
  messages: OrderCopyMessages,
): Order | null {
  if (orderCopy.status === "pending" || orderCopy.status === "in_progress") {
    return null
  }

  if (orderCopy.status === "aborted") {
    throw new Error(messages.aborted)
  }

  if (orderCopy.status === "failed" || orderCopy.target_order == null) {
    throw new Error(getOrderCopyErrorMessage(orderCopy) ?? messages.failed)
  }

  return orderCopy.target_order
}

/**
 * The errors of a failed copy as one sentence, from its `errors_log`. Core
 * groups them by the copy step that failed, then by field (e.g.
 * `{ copy_order: { payment_method: ["is disabled"] } }` reads
 * "Payment method is disabled"), and repeats an error in every step it breaks,
 * so each one is shown once. `null` when there are none.
 */
export function getOrderCopyErrorMessage(
  orderCopy: Pick<OrderCopy, "errors_log">,
): string | null {
  const errorsLog = orderCopy.errors_log
  if (errorsLog == null) {
    return null
  }

  const messages = [...new Set(getFieldErrors(errorsLog))]
  if (messages.length === 0) {
    return null
  }

  return messages.join(". ")
}

/** Every `field error` of the log, whatever step it is nested in. */
function getFieldErrors(errorsLog: object): string[] {
  return Object.entries(errorsLog).flatMap(([key, errors]) => {
    if (isErrorGroup(errors)) {
      return getFieldErrors(errors)
    }

    return toList(errors).map((error) => getFieldError(key, error))
  })
}

/**
 * The error as a sentence: a field's own error gets the field in front
 * ("is disabled" reads "Payment method is disabled"), while one that already is
 * a sentence (a record that failed to save) is shown without the generic
 * "Validation failed:" Core puts in front of it.
 */
function getFieldError(field: string, error: string): string {
  if (/^[A-Z]/.test(error)) {
    return error.replace(/^Validation failed: /, "")
  }

  return `${capitalize(lowerCase(field))} ${error}`
}

function isErrorGroup(errors: unknown): errors is object {
  return errors != null && typeof errors === "object" && !Array.isArray(errors)
}

function toList(errors: unknown): string[] {
  if (Array.isArray(errors)) {
    return errors.map(String)
  }

  return [String(errors)]
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
