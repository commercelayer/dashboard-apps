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
import { type GiftCard } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import { useEffect, useReducer, type Reducer } from 'react'

import { isAttachmentValidNote, noteReferenceOrigin } from '#data/attachments'
import { useGiftCardDetails } from '#hooks/useGiftCardDetails'

interface Props {
  giftCard: GiftCard
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
  giftCard: GiftCard
): [TimelineEvent[], React.Dispatch<TimelineReducerAction>] => {
  const [events, dispatch] = useReducer(timelineReducer, [])
  const { t } = useTranslation()

  useEffect(
    function addCreated() {
      if (giftCard.created_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: giftCard.created_at,
            message: t('common.timeline.resource_created', {
              resource: t('resources.gift_cards.name').toLowerCase()
            })
          }
        })
      }
    },
    [giftCard.created_at]
  )

  useEffect(
    function addLastUpdate() {
      if (giftCard.updated_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: giftCard.updated_at,
            message: t('common.timeline.resource_updated', {
              resource: t('resources.gift_cards.name').toLowerCase()
            })
          }
        })
      }
    },
    [giftCard.updated_at]
  )

  useEffect(
    function addAttachments() {
      if (giftCard.attachments != null) {
        giftCard.attachments.forEach((attachment) => {
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
    [giftCard.attachments]
  )

  return [events, dispatch]
}

export const GiftCardTimeline = withSkeletonTemplate<Props>(({ giftCard }) => {
  const [events] = useTimelineReducer(giftCard)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const { mutateGiftCard } = useGiftCardDetails(giftCard.id)
  const { t } = useTranslation()

  console.log('user', user)

  return (
    <Section title={t('common.timeline.name')}>
      <Spacer top='8'>
        <Timeline
          events={events}
          timezone={user?.timezone}
          onKeyDown={(event) => {
            if (event.code === 'Enter' && event.currentTarget.value !== '') {
              console.log('user', user)
              if (user?.displayName != null && !isEmpty(user.displayName)) {
                void sdkClient.attachments
                  .create({
                    reference_origin: noteReferenceOrigin,
                    name: user.displayName,
                    description: event.currentTarget.value,
                    attachable: { type: 'gift_cards', id: giftCard.id }
                  })
                  .then(() => {
                    void mutateGiftCard()
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
