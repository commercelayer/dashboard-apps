import {
  Dropdown,
  DropdownItem,
  Icon,
  ResourceListItem,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { makeOrder } from "#mocks"

interface Props {
  resource?: Order
}

function ListItemOrderComponent({
  resource = makeOrder(),
}: Props): React.JSX.Element {
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
      // the row's shape is the order transformer's: number + status badge, the
      // date, the total. Only the menu is this page's business.
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
}

export const ListItemOrder = withSkeletonTemplate(ListItemOrderComponent)
