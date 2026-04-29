import {
  Button,
  Icon,
  Section,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { useLocation, useRoute } from "wouter"
import { ListItemOrder } from "#components/ListItemOrder"
import { appRoutes } from "#data/routes"
import { useCustomerOrdersList } from "#hooks/useCustomerOrdersList"

export const CustomerLastOrders = withSkeletonTemplate(
  (): React.JSX.Element => {
    const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
    const [, setLocation] = useLocation()
    const { t } = useTranslation()
    const customerId = params?.customerId ?? ""

    const { orders } = useCustomerOrdersList({
      id: customerId ?? "",
      settings: { pageSize: 5 },
    })
    if (customerId.length === 0) return <></>
    if (orders === undefined || orders?.meta.recordCount === 0) return <></>

    const showAll = orders != null && orders?.meta.pageCount > 1
    const ordersListItems = orders?.map((order) => {
      return <ListItemOrder resource={order} key={order.id} />
    })

    return (
      <Section
        title={`${t("resources.orders.name_other")} · ${orders?.meta?.recordCount}`}
        actionButton={
          showAll && (
            <Button
              variant="secondary"
              size="mini"
              onClick={() => {
                setLocation(appRoutes.orders.makePath(customerId))
              }}
              alignItems="center"
            >
              <Icon name="eye" size={16} />
              {t("common.see_all")}
            </Button>
          )
        }
      >
        {ordersListItems}
      </Section>
    )
  },
)
