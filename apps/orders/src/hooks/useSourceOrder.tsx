import {
  isMockedId,
  useCoreApi,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"

/**
 * The order this one was duplicated from, if any. An order exposes only the
 * copies made from it, so the copy that made it is looked up by its target.
 * Not looked up at all without access to order copies, as the request would
 * only be refused.
 */
export function useSourceOrder(orderId: string): {
  sourceOrder?: Order
  isLoading: boolean
} {
  const { canUser } = useTokenProvider()
  const { data: orderCopies, isLoading } = useCoreApi(
    "order_copies",
    "list",
    isMockedId(orderId) || !canUser("read", "order_copies")
      ? null
      : [
          {
            filters: { target_order_id_eq: orderId, status_eq: "completed" },
            include: ["source_order"],
            fields: {
              order_copies: ["id", "source_order"],
              orders: ["id", "number"],
            },
            pageSize: 1,
          },
        ],
  )

  return {
    sourceOrder: orderCopies?.[0]?.source_order ?? undefined,
    isLoading,
  }
}
