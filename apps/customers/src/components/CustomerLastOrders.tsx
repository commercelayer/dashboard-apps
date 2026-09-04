import {
  useResourceList,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { useRoute } from "wouter"
import { ListItemOrder } from "#components/ListItemOrder"
import { appRoutes } from "#data/routes"

export const CustomerLastOrders = withSkeletonTemplate(
  (): React.JSX.Element => {
    const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
    const { t } = useTranslation()
    const customerId = params?.customerId ?? ""

    const { ResourceList, Pagination, meta } = useResourceList({
      type: "orders",
      query: {
        filters: {
          customer_id_eq: customerId,
          status_matches_any: "placed,approved,editing,cancelled",
        },
        include: ["billing_address", "market"],
        sort: ["-placed_at"],
        pageSize: 5,
      },
      // five at a time with prev/next, so the whole history is here rather than
      // behind a "see all" link
      paginationType: "pagination",
      // the list is a section of a bigger page: paging it should not move the
      // page around the reader
      paginationScrollTo: "none",
    })

    if (customerId.length === 0 || meta?.recordCount === 0) {
      return <></>
    }

    return (
      <>
        <ResourceList
          // nested in this page: gray card, dashed rules between rows
          variant="boxed"
          // as a function, so the record count is not interpolated into it
          title={() => t("resources.orders.name_other")}
          ItemTemplate={ListItemOrder}
        />
        <Pagination />
      </>
    )
  },
)
