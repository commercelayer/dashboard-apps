import {
  Section,
  Spacer,
  Text,
  Timeline,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
  type TimelineEvent
} from '@commercelayer/app-elements'
import { type Customer } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useReducer, type Reducer } from 'react'

import { isAttachmentValidNote, noteReferenceOrigin } from '#data/attachments'
import { useCustomerDetails } from '#hooks/useCustomerDetails'

interface Props {
  customer: Customer
}

interface TimelineReducerAction {
  type: 'add'
  payload: TimelineEvent
}

const timelineReducer: Reducer<TimelineEvent[], TimelineReducerAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'add':
      if (state.find((s) => s.date === action.payload.date) != null) {
        return state
      }

      return [...state, action.payload]
    default:
      return state
  }
}

const useTimelineReducer = (
  customer: Customer
): [TimelineEvent[], React.Dispatch<TimelineReducerAction>] => {
  const [events, dispatch] = useReducer(timelineReducer, [])
  const { t } = useTranslation()

  useEffect(
    function addPlaced() {
      if (customer.created_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: customer.created_at,
            message: t('common.timeline.resource_created', {
              resource: t('resources.customers.name').toLowerCase()
            })
          }
        })
      }
    },
    [customer.created_at]
  )

  useEffect(
    function addCancelled() {
      if (customer.updated_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: customer.updated_at,
            message: t('common.timeline.resource_updated', {
              resource: t('resources.customers.name').toLowerCase()
            })
          }
        })
      }
    },
    [customer.updated_at]
  )

  useEffect(
    function addOrders() {
      if (customer.orders != null) {
        customer.orders.forEach((order) => {
          if (order.placed_at != null) {
            const orderNumber = order?.number?.toString() ?? ''
            const orderMarket = order?.market?.name ?? ''
            dispatch({
              type: 'add',
              payload: {
                date: order.placed_at,
                message: t('common.timeline.order_placed', {
                  number: orderNumber,
                  market: orderMarket
                })
              }
            })
          }
        })
      }
    },
    [customer.orders]
  )

  useEffect(
    function addAttachments() {
      if (customer.attachments != null) {
        customer.attachments.forEach((attachment) => {
          if (isAttachmentValidNote(attachment)) {
            dispatch({
              type: 'add',
              payload: {
                date: attachment.updated_at,
                message: (
                  <span>
                    <Text weight='bold' className='text-gray-500'>
                      {attachment.name}
                    </Text>{' '}
                    {t('common.timeline.left_a_note')}
                  </span>
                ),
                note: attachment.description
              }
            })
          }
        })
      }
    },
    [customer.attachments]
  )

  return [events, dispatch]
}

export const CustomerTimeline = withSkeletonTemplate<Props>(({ customer }) => {
  const [events] = useTimelineReducer(customer)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const { mutateCustomer } = useCustomerDetails(customer.id)
  const { t } = useTranslation()

  return (
    <Section title={t('common.timeline.name')}>
      <Spacer top='8'>
        <Timeline
          events={events}
          timezone={user?.timezone}
          onKeyDown={(event) => {
            if (event.code === 'Enter' && event.currentTarget.value !== '') {
              if (user?.displayName != null && !isEmpty(user.displayName)) {
                void sdkClient.attachments
                  .create({
                    reference_origin: noteReferenceOrigin,
                    name: user.displayName,
                    description: event.currentTarget.value,
                    attachable: { type: 'customers', id: customer.id }
                  })
                  .then(() => {
                    void mutateCustomer()
                  })
              } else {
                console.warn(
                  `Cannot create the attachment: token does not contain a valid "user".`
                )
              }

              event.currentTarget.value = ''
            }
          }}
        />
      </Spacer>
    </Section>
  )
})
