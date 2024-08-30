import { EditOrderStep } from '#components/NewOrder/EditOrderStep'
import { SelectMarketStep } from '#components/NewOrder/SelectMarketStep'
import type { PageProps } from '#components/Routes'
import { type appRoutes } from '#data/routes'

// NbQLhymvel

function NewOrderPage(
  props: PageProps<typeof appRoutes.new>
): JSX.Element | null {
  if (props.params.orderId != null) {
    return (
      <EditOrderStep overlay={props.overlay} orderId={props.params.orderId} />
    )
  }

  return <SelectMarketStep overlay={props.overlay} />
}

export default NewOrderPage
