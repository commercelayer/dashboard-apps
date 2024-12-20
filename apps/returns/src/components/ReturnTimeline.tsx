import { isAttachmentValidNote, referenceOrigins } from '#data/attachments'
import { isMockedId } from '#mocks'
import {
  getOrderTransactionName,
  Text,
  Timeline,
  Trans,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
  type TimelineEvent
} from '@commercelayer/app-elements'

import type { Attachment, Return, ReturnLineItem } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import {
  useCallback,
  useEffect,
  useReducer,
  useState,
  type Reducer
} from 'react'

export const ReturnTimeline = withSkeletonTemplate<{
  returnId?: string
  refresh?: boolean
  attachmentOption?: {
    onMessage?: (attachment: Attachment) => void
    referenceOrigin: typeof referenceOrigins.appReturnsNote
  }
}>(({ returnId, attachmentOption, refresh, isLoading: isExternalLoading }) => {
  const fakeReturnId = 'fake-NMWYhbGorj'
  const {
    data: returnObj,
    isLoading,
    mutate: mutateReturn
  } = useCoreApi(
    'returns',
    'retrieve',
    returnId == null || isEmpty(returnId) || isMockedId(returnId)
      ? null
      : [
          returnId,
          {
            include: [
              'order',
              'reference_refund',
              'customer',
              'return_line_items',
              'attachments'
            ]
          }
        ],
    {
      fallbackData: {
        type: 'returns',
        id: fakeReturnId,
        status: 'approved',
        created_at: '2020-05-16T11:06:02.074Z',
        updated_at: '2020-05-16T14:18:35.572Z',
        approved_at: '2020-05-16T14:18:16.775Z'
      } satisfies Return
    }
  )

  const [events] = useTimelineReducer(returnObj)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()

  useEffect(
    function refreshReturn() {
      if (refresh === true) {
        void mutateReturn()
      }
    },
    [refresh]
  )

  return (
    <Timeline
      isLoading={
        isExternalLoading === true || isLoading || returnObj.id === fakeReturnId
      }
      events={events}
      timezone={user?.timezone}
      onKeyDown={(event) => {
        if (event.code === 'Enter' && event.currentTarget.value !== '') {
          if (
            attachmentOption?.referenceOrigin == null ||
            ![referenceOrigins.appReturnsNote].includes(
              attachmentOption.referenceOrigin
            )
          ) {
            console.warn(
              `Cannot create the attachment: "referenceOrigin" is not valid.`
            )
            return
          }

          if (user?.displayName == null || isEmpty(user.displayName)) {
            console.warn(
              `Cannot create the attachment: token does not contain a valid "user".`
            )
            return
          }

          void sdkClient.attachments
            .create({
              reference_origin: attachmentOption.referenceOrigin,
              name: user.displayName,
              description: event.currentTarget.value,
              attachable: { type: 'returns', id: returnObj.id }
            })
            .then((attachment) => {
              void mutateReturn()
              attachmentOption?.onMessage?.(attachment)
            })

          event.currentTarget.value = ''
        }
      }}
    />
  )
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useTimelineReducer = (returnObj: Return) => {
  const [returnId, setReturnId] = useState<string>(returnObj.id)
  const { t } = useTranslation()

  const [events, dispatch] = useReducer<
    Reducer<
      TimelineEvent[],
      | {
          type: 'add'
          payload: TimelineEvent
        }
      | {
          type: 'clear'
        }
    >
  >((state, action) => {
    switch (action.type) {
      case 'clear':
        return []
      case 'add':
        if (state.find((s) => s.date === action.payload.date) != null) {
          return state
        }

        return [...state, action.payload]
      default:
        return state
    }
  }, [])

  useEffect(
    function clearState() {
      if (returnObj.id !== returnId) {
        dispatch({ type: 'clear' })
        setReturnId(returnObj.id)
      }
    },
    [returnObj.id]
  )

  useEffect(
    function addPlaced() {
      if (returnObj.created_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.created_at,
            message: t('apps.returns.details.timeline_requested_return', {
              email: returnObj.customer?.email,
              count: returnObj.return_line_items?.length ?? 0
            })
          }
        })
      }
    },
    [returnObj.created_at]
  )

  useEffect(
    function addShipped() {
      if (returnObj.shipped_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.shipped_at,
            message: (
              <Trans
                i18nKey='apps.returns.details.timeline_shipped'
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.shipped_at]
  )

  useEffect(
    function addReceived() {
      if (returnObj.received_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.received_at,
            message: (
              <Trans
                i18nKey='apps.returns.details.timeline_received'
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.received_at]
  )

  useEffect(
    function addCancelled() {
      if (returnObj.cancelled_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.cancelled_at,
            message: (
              <Trans
                i18nKey='apps.returns.details.timeline_cancelled'
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.cancelled_at]
  )

  useEffect(
    function addArchived() {
      if (returnObj.archived_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.archived_at,
            message: (
              <Trans
                i18nKey='apps.returns.details.timeline_archived'
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.archived_at]
  )

  useEffect(
    function addApproved() {
      if (returnObj.approved_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.approved_at,

            message: (
              <Trans
                i18nKey='apps.returns.details.timeline_approved'
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.approved_at]
  )

  useEffect(
    function addRefunds() {
      if (returnObj.reference_refund != null) {
        const name = getOrderTransactionName('refunds')
        dispatch({
          type: 'add',
          payload: {
            date: returnObj.reference_refund.created_at,
            message: returnObj.reference_refund.succeeded ? (
              <Trans
                i18nKey='apps.returns.details.timeline_payment_of_amount_was_action'
                values={{
                  amount: returnObj.reference_refund.formatted_amount,
                  action: name.pastTense
                }}
                components={{ strong: <Text weight='bold' /> }}
              />
            ) : (
              // `Payment capture of xxxx failed` or `Authorization of xxxx failed`, etc...
              <Trans
                i18nKey='apps.returns.details.timeline_action_of_amount_failed'
                values={{
                  action: name.pastTense,
                  amount: returnObj.reference_refund.formatted_amount
                }}
                components={{ strong: <Text weight='bold' /> }}
              />
            )
          }
        })
      }
    },
    [returnObj.reference_refund]
  )

  const dispatchRestockedReturnLineItems = useCallback(
    (returnLineItems?: ReturnLineItem[] | null | undefined) => {
      if (returnLineItems != null) {
        returnLineItems.forEach((returnLineItem) => {
          if (returnLineItem.restocked_at != null) {
            dispatch({
              type: 'add',
              payload: {
                date: returnLineItem.restocked_at,
                message: (
                  <Trans
                    i18nKey='apps.returns.details.timeline_item_code_restocked'
                    values={{
                      code:
                        returnLineItem.sku_code ?? returnLineItem.bundle_code
                    }}
                    components={{ strong: <Text weight='bold' /> }}
                  />
                )
              }
            })
          }
        })
      }
    },
    []
  )

  const dispatchAttachments = useCallback(
    (attachments?: Attachment[] | null | undefined) => {
      if (attachments != null) {
        attachments.forEach((attachment) => {
          if (
            isAttachmentValidNote(attachment, [
              referenceOrigins.appReturnsNote,
              referenceOrigins.appReturnsRefundNote
            ])
          ) {
            dispatch({
              type: 'add',
              payload: {
                date: attachment.updated_at,
                author: attachment.name,
                message: (
                  <span>
                    {attachment.reference_origin ===
                    referenceOrigins.appReturnsRefundNote
                      ? t('common.timeline.left_a_refund_note')
                      : t('common.timeline.left_a_note')}
                  </span>
                ),
                note: attachment.description
              }
            })
          }
        })
      }
    },
    []
  )

  useEffect(
    function addRestockedReturnLineItems() {
      dispatchRestockedReturnLineItems(returnObj.return_line_items)
    },
    [returnObj.return_line_items]
  )

  useEffect(
    function addAttachments() {
      dispatchAttachments(returnObj.attachments)
    },
    [returnObj.attachments]
  )

  return [events, dispatch] as const
}
