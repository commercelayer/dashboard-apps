import { getLastOrderReview, useCoreApi } from "@commercelayer/app-elements"
import type { Order, OrderReview } from "@commercelayer/sdk"
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

interface AgreementOrderReviewsContextValue {
  /** Adds the order to the next lookup; the returned function takes it out. */
  register: (orderId: string) => () => void
  ordersById: Map<string, Order>
}

const AgreementOrderReviewsContext =
  createContext<AgreementOrderReviewsContextValue | null>(null)

/**
 * B2B: what Metrics does not know about an agreement order — whether it is on
 * hold for a customer review, and how its latest review was answered — read
 * from Core for the rows on screen.
 *
 * Rows register their order while they are mounted, and the ids still mounted
 * make a single `orders` list filtered by `id_in`, with the reviews included:
 * one request for the page, as a page holds at most 25 rows, Core's largest.
 *
 * Mounted only for an organization that sells under agreements, and only rows
 * of agreement orders register, see `useAgreementOrderReview`.
 */
export const AgreementOrderReviewsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  /** How many cells of each order are mounted: a row can show its status twice. */
  const [mounted, setMounted] = useState<Record<string, number>>({})

  const register = useCallback((orderId: string) => {
    setMounted((current) => ({
      ...current,
      [orderId]: (current[orderId] ?? 0) + 1,
    }))

    return () => {
      setMounted((current) => {
        const { [orderId]: count = 0, ...others } = current
        return count > 1 ? { ...others, [orderId]: count - 1 } : others
      })
    }
  }, [])

  const orderIds = Object.keys(mounted).sort()
  const { data: orders } = useCoreApi(
    "orders",
    "list",
    orderIds.length === 0
      ? null
      : [
          {
            filters: { id_in: orderIds.join(",") },
            include: ["order_reviews"],
            fields: {
              orders: ["id", "on_hold", "order_reviews"],
              order_reviews: ["status", "created_at"],
            },
            pageSize: 25,
          },
        ],
  )

  const value = useMemo(
    () => ({
      register,
      ordersById: new Map((orders ?? []).map((order) => [order.id, order])),
    }),
    [register, orders],
  )

  return (
    <AgreementOrderReviewsContext.Provider value={value}>
      {children}
    </AgreementOrderReviewsContext.Provider>
  )
}

/**
 * A row's order with what Core says about its review: `on_hold` set from Core,
 * and the latest review. Unchanged, with no review, outside the provider, for
 * an order not under an agreement, and until the lookup answers.
 */
export function useAgreementOrderReview(order: Order): {
  order: Order
  lastReview: OrderReview | null
} {
  const context = useContext(AgreementOrderReviewsContext)
  const register = context?.register
  const isAgreementOrder = register != null && order.agreement != null

  useEffect(() => {
    if (register == null || !isAgreementOrder) {
      return
    }
    return register(order.id)
  }, [register, isAgreementOrder, order.id])

  const fromCore = isAgreementOrder
    ? context?.ordersById.get(order.id)
    : undefined

  return fromCore == null
    ? { order, lastReview: null }
    : {
        order: { ...order, on_hold: fromCore.on_hold },
        lastReview: getLastOrderReview(fromCore),
      }
}
