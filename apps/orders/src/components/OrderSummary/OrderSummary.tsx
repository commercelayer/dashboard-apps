import {
  ActionButtons,
  Spacer,
  Text,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useActionButtons } from "./hooks/useActionButtons"
import { OrderLineItems } from "./OrderLineItems"

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element => {
    const { canUser } = useTokenProvider()
    const { t } = useTranslation()
    const {
      actions,
      errors,
      CancelDialog,
      CaptureDialog,
      SelectShippingMethodOverlay,
    } = useActionButtons({ order })

    return (
      <OrderLineItems title={t("apps.orders.details.summary")} order={order}>
        {canUser("update", "orders") && (
          <div className="print:hidden">
            <ActionButtons actions={actions} />
          </div>
        )}

        {renderErrorMessages(errors)}

        {CaptureDialog}

        {CancelDialog}

        <SelectShippingMethodOverlay order={order} />
      </OrderLineItems>
    )
  },
)

function renderErrorMessages(errors?: string[]): React.JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top="4">
      {errors.map((message) => (
        <Text key={message} variant="danger">
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
