import { RefundForm } from '#components/RefundForm'
import { refundNoteReferenceOrigin } from '#data/attachments'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function Refund(): JSX.Element {
  const { canUser, user } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.refund.path)
  const orderId = params?.orderId ?? ''

  const [saveApiError, setSaveApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: order,
    isLoading,
    error
  } = useCoreApi('orders', 'retrieve', [
    orderId,
    {
      include: ['captures', 'payment_method', 'payment_source']
    }
  ])

  const capture = order?.captures?.find((c) => c.succeeded)
  const isRefundable =
    capture?.refund_balance_cents != null && capture.refund_balance_cents > 0

  const processRefund = async (
    captureId: string,
    amountCent: number
  ): Promise<void> => {
    try {
      setIsSaving(true)
      await sdkClient.captures.update({
        id: captureId,
        _refund: true,
        _refund_amount_cents: amountCent
      })
    } catch (error) {
      setSaveApiError(error)
      setIsSaving(false)
      throw error
    }
  }

  const saveNote = async (orderId: string, note?: string): Promise<void> => {
    if (
      user?.displayName != null &&
      !isEmpty(user.displayName) &&
      !isEmpty(note?.trim())
    ) {
      try {
        await sdkClient.attachments.create({
          reference_origin: refundNoteReferenceOrigin,
          name: user.displayName,
          description: note,
          attachable: { type: 'orders', id: orderId }
        })
      } catch (error) {
        // do nothing, silently fail
        // when the attachments is not created, the process continues since the refund is already done
      }
    }
    setLocation(appRoutes.details.makePath({ orderId }))
  }

  if (isLoading) {
    return <></>
  }

  if (
    !canUser('update', 'transactions') ||
    !isRefundable ||
    error != null ||
    order == null
  ) {
    return (
      <PageLayout title='Issue a refund'>
        <EmptyState
          title='Not found'
          description={
            !canUser('update', 'transactions')
              ? 'You are not authorized to access this page.'
              : 'Cannot make refund on this order'
          }
          action={
            <Link href={appRoutes.details.makePath({ orderId })}>
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
      defaultValues={{}}
      capture={capture}
      isSubmitting={isSaving}
      apiError={saveApiError}
      onSubmit={({ amountCents, note }) => {
        setIsSaving(false)
        void processRefund(capture.id, amountCents).then(() => {
          void saveNote(order.id, note)
        })
      }}
    />
  )
}

export default Refund
