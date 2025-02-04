import { EditOrderStep } from '#components/NewOrder/EditOrderStep'
import { SelectMarketStep } from '#components/NewOrder/SelectMarketStep'
import { type appRoutes } from '#data/routes'
import { useTokenProvider, type PageProps } from '@commercelayer/app-elements'

function NewOrderPage(
  props: PageProps<typeof appRoutes.new>
): JSX.Element | null {
  const { shouldRender } = useTokenProvider()

  if (shouldRender('create')) {
    return null
  }

  if (props.params.orderId != null) {
    return (
      <EditOrderStep overlay={props.overlay} orderId={props.params.orderId} />
    )
  }

  return <SelectMarketStep overlay={props.overlay} />
}

export default NewOrderPage
