import {
  parseApiError,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useEffect, useState } from "react"
import {
  getOrderPaymentTotals,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"

interface OrderPaymentRulesCheckHook {
  isBlockedByPaymentRules: boolean
  /** True while the answer is not in yet, so Finish is not offered on a guess. */
  isCheckingPaymentRules: boolean
}

/** Whether the market's payment rules stop the edit from being finished, checked with a `_placeable` dry run. */
export function useOrderPaymentRulesCheck(
  order: Order,
): OrderPaymentRulesCheckHook {
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const [isBlocked, setIsBlocked] = useState(false)
  /** The `coverageKey` the current answer was computed for. */
  const [checkedKey, setCheckedKey] = useState<string>()

  const shouldCheck =
    // `_placeable` is an update, and only someone who can finish the edit
    // needs to know whether it would go through.
    canUser("update", "orders") &&
    order.status === "editing" &&
    isNewPaymentModel(order) &&
    getOrderPaymentTotals(order).toCollectCents > 0

  /** What the rules measure. Not `updated_at`: a passing check saves the order, which would re-trigger it. */
  const coverageKey = [
    order.id,
    order.total_amount_with_taxes_cents,
    ...(order.payment_sessions ?? []).map(
      (session) => `${session.id}:${session.status}`,
    ),
  ].join("|")

  useEffect(() => {
    if (!shouldCheck) {
      setIsBlocked(false)
      return
    }

    let isCurrent = true

    sdkClient.orders
      .update({ id: order.id, _placeable: true })
      .then(
        () => {
          if (isCurrent) setIsBlocked(false)
        },
        (error: unknown) => {
          if (isCurrent) setIsBlocked(isPaymentRuleError(error))
        },
      )
      .finally(() => {
        if (isCurrent) setCheckedKey(coverageKey)
      })

    return () => {
      isCurrent = false
    }
  }, [shouldCheck, coverageKey])

  return {
    isBlockedByPaymentRules: shouldCheck && isBlocked,
    isCheckingPaymentRules: shouldCheck && checkedKey !== coverageKey,
  }
}

/** True for a payment rule failure, whose detail starts with `payment_action`. */
function isPaymentRuleError(error: unknown): boolean {
  return parseApiError(error).some(({ detail }) =>
    detail.startsWith("payment_action"),
  )
}
