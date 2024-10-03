import { referenceOrigins } from '#data/attachments'
import { isMockedId } from '#mocks'
import {
  Section,
  Spacer,
  Text,
  Timeline,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate,
  type TimelineEvent
} from '@commercelayer/app-elements'

import type { Attachment, StockTransfer } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useReducer, useState, type Reducer } from 'react'

export const StockTransferTimeline = withSkeletonTemplate<{
  stockTransferId?: string
  refresh?: boolean
  attachmentOption?: {
    onMessage?: (attachment: Attachment) => void
    referenceOrigin: typeof referenceOrigins.appStockTransfersNote
  }
}>(
  ({
    stockTransferId,
    attachmentOption,
    refresh,
    isLoading: isExternalLoading
  }) => {
    const fakeStockTransferId = 'fake-NMWYhbGorj'
    const {
      data: stockTransfer,
      isLoading,
      mutate: mutateStockTransfer
    } = useCoreApi(
      'stock_transfers',
      'retrieve',
      stockTransferId == null ||
        isEmpty(stockTransferId) ||
        isMockedId(stockTransferId)
        ? null
        : [stockTransferId],
      {
        fallbackData: {
          type: 'stock_transfers',
          id: fakeStockTransferId,
          status: 'upcoming',
          quantity: 1,
          created_at: '2020-05-16T11:06:02.074Z',
          updated_at: '2020-05-16T14:18:35.572Z'
        } satisfies StockTransfer
      }
    )

    const [events] = useTimelineReducer(stockTransfer)
    const { sdkClient } = useCoreSdkProvider()
    const { user } = useTokenProvider()

    useEffect(
      function refreshStockTransfer() {
        if (refresh === true) {
          void mutateStockTransfer()
        }
      },
      [refresh]
    )

    return (
      <Section title='Timeline'>
        <Spacer top='8'>
          <Timeline
            isLoading={
              isExternalLoading === true ||
              isLoading ||
              stockTransfer.id === fakeStockTransferId
            }
            events={events}
            timezone={user?.timezone}
            onKeyDown={(event) => {
              if (event.code === 'Enter' && event.currentTarget.value !== '') {
                if (
                  attachmentOption?.referenceOrigin == null ||
                  ![referenceOrigins.appStockTransfersNote].includes(
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
                    attachable: { type: 'returns', id: stockTransfer.id }
                  })
                  .then((attachment) => {
                    void mutateStockTransfer()
                    attachmentOption?.onMessage?.(attachment)
                  })

                event.currentTarget.value = ''
              }
            }}
          />
        </Spacer>
      </Section>
    )
  }
)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useTimelineReducer = (stockTransfer: StockTransfer) => {
  const [stockTransferId, setStockTransferId] = useState<string>(
    stockTransfer.id
  )

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
      if (stockTransfer.id !== stockTransferId) {
        dispatch({ type: 'clear' })
        setStockTransferId(stockTransfer.id)
      }
    },
    [stockTransfer.id]
  )

  useEffect(
    function addCreated() {
      if (stockTransfer.created_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: stockTransfer.created_at,
            message: (
              <>
                Stock transfer was <Text weight='bold'>created</Text>
              </>
            )
          }
        })
      }
    },
    [stockTransfer.created_at]
  )

  useEffect(
    function addShipped() {
      if (stockTransfer.completed_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: stockTransfer.completed_at,
            message: (
              <>
                Stock transfer was <Text weight='bold'>completed</Text>
              </>
            )
          }
        })
      }
    },
    [stockTransfer.completed_at]
  )

  useEffect(
    function addReceived() {
      if (stockTransfer.cancelled_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: stockTransfer.cancelled_at,
            message: (
              <>
                Stock transfer was <Text weight='bold'>cancelled</Text>
              </>
            )
          }
        })
      }
    },
    [stockTransfer.cancelled_at]
  )

  return [events, dispatch] as const
}

StockTransferTimeline.displayName = 'StockTransferTimeline'
