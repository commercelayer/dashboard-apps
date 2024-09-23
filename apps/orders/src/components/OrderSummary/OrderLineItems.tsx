import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  ResourceLineItems,
  Section,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { HeaderActions } from './HeaderActions'
import { useAddItemOverlay } from './hooks/useAddItemOverlay'
import { useOrderStatus } from './hooks/useOrderStatus'
import { useSummaryRows } from './hooks/useSummaryRows'

interface Props {
  title: string
  order: Order
  children?: React.ReactNode
}

export const OrderLineItems = withSkeletonTemplate<Props>(
  ({ title, order, children }): JSX.Element => {
    const { sdkClient } = useCoreSdkProvider()
    const { mutateOrder } = useOrderDetails(order.id)
    const { summaryRows } = useSummaryRows(order)

    const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
      useAddItemOverlay(order)

    const { isEditing } = useOrderStatus(order)

    return (
      <Section title={title} actionButton={<HeaderActions order={order} />}>
        <AddItemOverlay />
        <ResourceLineItems
          items={order.line_items ?? []}
          editable={isEditing}
          onChange={() => {
            void mutateOrder()
          }}
          onSwap={(itemToSwap) => {
            showAddItemOverlay(
              itemToSwap.item_type === 'skus' ||
                itemToSwap.item_type === 'bundles'
                ? itemToSwap.item_type
                : 'skus',
              (selectedItem) => {
                void sdkClient.line_items
                  .create({
                    order: sdkClient.orders.relationship(order.id),
                    quantity: 1,
                    ...(selectedItem.type === 'skus'
                      ? { sku_code: selectedItem.code }
                      : { bundle_code: selectedItem.code })
                  })
                  .then(async () => {
                    await sdkClient.line_items.delete(itemToSwap.id)
                  })
                  .then(() => {
                    void mutateOrder()
                  })
              }
            )
          }}
          footer={summaryRows}
        />

        {children}
      </Section>
    )
  }
)
