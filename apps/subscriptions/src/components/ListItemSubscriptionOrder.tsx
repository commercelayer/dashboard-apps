import {
  Dropdown,
  DropdownItem,
  Icon,
  ResourceListItem,
  type ResourceListItemTemplateProps,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { makeOrder } from "#mocks"

/**
 * One of a subscription's recurring orders.
 *
 * The subscription is the page, so the row drops the status icon and the
 * customer, keeps the order number with its status as a badge, and opens the
 * order from its own menu rather than by clicking the row.
 */
export const ListItemSubscriptionOrder = withSkeletonTemplate<
  ResourceListItemTemplateProps<"orders">
>(({ resource = makeOrder() }): React.JSX.Element | null => {
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const navigateToOrder = canAccess("orders")
    ? navigateTo({
        app: "orders",
        resourceId: resource.id,
      })
    : {}

  return (
    <ResourceListItem
      resource={resource}
      actions={
        canAccess("orders") ? (
          <Dropdown
            dropdownLabel={<Icon name="dotsThree" size={24} />}
            dropdownItems={
              <DropdownItem label="View order" {...navigateToOrder} />
            }
          />
        ) : undefined
      }
    />
  )
})
