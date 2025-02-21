import { refundNoteReferenceOrigin } from '#data/attachments'
import { appRoutes } from '#data/routes'
import RefundPage from 'dashboard-apps-common/src/pages/RefundPage'
import { useRoute } from 'wouter'

function Refund(): React.JSX.Element {
  const [, params] = useRoute<{ orderId: string }>(appRoutes.refund.path)
  const orderId = params?.orderId ?? ''

  return (
    <RefundPage
      resourceType='orders'
      resourceId={orderId}
      noteReferenceOrigin={refundNoteReferenceOrigin}
      goBackUrl={appRoutes.details.makePath({ orderId })}
    />
  )
}

export default Refund
