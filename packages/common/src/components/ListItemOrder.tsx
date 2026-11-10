import {
  ResourceListItem,
  type ResourceListItemTemplateProps,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { makeOrder } from "../mocks"

/**
 * An order listed inside the resource it belongs to (a customer, a
 * subscription), as the `ItemTemplate` of a `useResourceList`.
 *
 * The row's shape is the order transformer's: number + status badge, the date,
 * the total. Only the link is this component's business: the whole row opens the
 * order, with a caret after the total. Without access to the orders app it is
 * plain content.
 */
export const ListItemOrder = withSkeletonTemplate<
  ResourceListItemTemplateProps<"orders">
>(({ resource = makeOrder() }): React.JSX.Element => {
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const navigateToOrder = canAccess("orders")
    ? navigateTo({
        app: "orders",
        resourceId: resource.id,
      })
    : {}

  return <ResourceListItem resource={resource} {...navigateToOrder} />
})
