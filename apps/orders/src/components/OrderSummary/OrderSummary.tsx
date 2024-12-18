import {
  ActionButtons,
  Spacer,
  Text,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useActionButtons } from './hooks/useActionButtons'
import { OrderLineItems } from './OrderLineItems'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { canUser } = useTokenProvider()
    const { t } = useTranslation()
    const {
      actions,
      errors,
      dispatch,
      CancelOverlay,
      CaptureOverlay,
      SelectShippingMethodOverlay
    } = useActionButtons({ order })

    return (
      <OrderLineItems title={t('apps.orders.details.summary')} order={order}>
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
      </OrderLineItems>
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
