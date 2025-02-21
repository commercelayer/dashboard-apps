import { referenceOrigins } from '#data/attachments'
import { appRoutes } from '#data/routes'
import RefundPage from 'dashboard-apps-common/src/pages/RefundPage'
import { useRoute } from 'wouter'

function Refund(): React.JSX.Element {
  const [, params] = useRoute<{ returnId: string }>(appRoutes.refund.path)
  const returnId = params?.returnId ?? ''

  return (
    <RefundPage
      resourceType='returns'
      resourceId={returnId}
      noteReferenceOrigin={referenceOrigins.appReturnsRefundNote}
      goBackUrl={appRoutes.details.makePath(returnId)}
    />
  )
}

export default Refund
