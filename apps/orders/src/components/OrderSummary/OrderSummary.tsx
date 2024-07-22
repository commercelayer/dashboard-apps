import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  ActionButtons,
  ResourceLineItems,
  Section,
  Spacer,
  Text,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { HeaderActions } from './HeaderActions'
import { useActionButtons } from './hooks/useActionButtons'
import { useOrderStatus } from './hooks/useOrderStatus'
import { useSummaryRows } from './hooks/useSummaryRows'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { canUser } = useTokenProvider()
    const { mutateOrder } = useOrderDetails(order.id)
    const { summaryRows } = useSummaryRows(order)
    const {
      actions,
      errors,
      dispatch,
      CancelOverlay,
      CaptureOverlay,
      SelectShippingMethodOverlay
    } = useActionButtons({ order })

    const { isEditing } = useOrderStatus(order)

    return (
      <Section title='Summary' actionButton={<HeaderActions order={order} />}>
        <ResourceLineItems
          items={order.line_items ?? []}
          editable={isEditing}
          onChange={() => {
            void mutateOrder()
          }}
          footer={summaryRows}
        />

        {canUser('update', 'orders') && <ActionButtons actions={actions} />}

        {renderErrorMessages(errors)}

        <CaptureOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_capture')
          }}
        />

        <CancelOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_cancel')
          }}
        />

        <SelectShippingMethodOverlay order={order} />
      </Section>
    )
  }
)

function renderErrorMessages(errors?: string[]): JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top='4'>
      {errors.map((message, idx) => (
        <Text key={idx} variant='danger'>
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
