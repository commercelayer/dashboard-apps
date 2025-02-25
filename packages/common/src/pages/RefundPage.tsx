import {
  Button,
  EmptyState,
  PageLayout,
  useCoreApi,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { AttachmentCreate, Order, Return } from '@commercelayer/sdk'
import { Link } from 'wouter'
import { RefundForm } from '../components/RefundForm'

interface Props {
  resourceType: Return['type'] | Order['type']
  resourceId: string
  noteReferenceOrigin: string
  goBackUrl: string
}

function RefundPage({
  resourceType,
  resourceId,
  noteReferenceOrigin,
  goBackUrl
}: Props): React.JSX.Element {
  const { canUser } = useTokenProvider()

  const {
    data: resource,
    isLoading,
    error
  } = useCoreApi(resourceType, 'retrieve', [
    resourceId,
    {
      include:
        resourceType === 'orders'
          ? [
              'captures',

              // refund estimator
              'line_items',
              'payment_method',
              'refunds'
            ]
          : [
              'order.captures',

              // refund estimator
              'return_line_items.line_item',
              'order.payment_method',
              'order.refunds'
            ]
    }
  ])

  if (isLoading) {
    return <></>
  }

  const order = resource?.type === 'orders' ? resource : resource?.order

  const capture = order?.captures?.find((c) => c.succeeded)

  const isRefundable =
    capture?.refund_balance_cents != null && capture.refund_balance_cents > 0

  const lineItems =
    resource?.type === 'orders'
      ? resource.line_items
      : resource?.return_line_items

  const note: {
    referenceOrigin: string
    attachable: AttachmentCreate['attachable']
  } = {
    referenceOrigin: noteReferenceOrigin,
    attachable: {
      type: resourceType,
      id: resourceId
    }
  }

  if (
    !canUser('update', 'transactions') ||
    !isRefundable ||
    order == null ||
    resource == null ||
    capture == null ||
    lineItems == null ||
    error != null
  ) {
    return (
      <PageLayout title='Issue a refund'>
        <EmptyState
          title='Not found'
          description={
            !canUser('update', 'transactions')
              ? 'You are not authorized to access this page.'
              : 'Cannot make refund.'
          }
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <RefundForm
      order={order}
      lineItems={lineItems}
      goBackUrl={goBackUrl}
      defaultValues={{}}
      capture={capture}
      refundable={resource.type === 'returns' ? resource : capture}
      note={note}
    />
  )
}

export default RefundPage
