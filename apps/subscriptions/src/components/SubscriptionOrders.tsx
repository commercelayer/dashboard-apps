import {
  useResourceList,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order, OrderSubscription } from "@commercelayer/sdk"
import { ListItemSubscriptionOrder } from "#components/ListItemSubscriptionOrder"

export const allowedOrderStatuses: Array<Order["status"]> = [
  "pending",
  "placed",
  "approved",
]

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionOrders = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    const { ResourceList, Pagination, meta } = useResourceList({
      type: "orders",
      query: {
        filters: {
          order_subscription_id_eq: subscription.id,
          status_in: allowedOrderStatuses,
        },
        // a recurring order not placed yet has no `placed_at`, so this list stays
        // on `updated_at`: every row then has a date to be ordered by
        sort: ["-updated_at"],
        pageSize: 5,
      },
      // five at a time with prev/next, so every recurring order is reachable
      // here rather than behind a "see all" link
      paginationType: "pagination",
      // the list is a section of a bigger page: paging it should not move the
      // page around the reader
      paginationScrollTo: "none",
    })

    if (meta?.recordCount === 0) {
      return <></>
    }

    return (
      <>
        <ResourceList
          // nested in this page: gray card, dashed rules between rows
          variant="boxed"
          // as a function, so the record count is not interpolated into it
          title={() => "Recurring orders"}
          ItemTemplate={ListItemSubscriptionOrder}
        />
        <Pagination />
      </>
    )
  },
)
