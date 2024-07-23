import { makeEventCallback } from '#mocks'
import { eventCallbackStatusVariant } from '#utils/eventCallbackStatusVariant'
import { formatDateAndTime } from '#utils/formatDateAndTime'
import {
  Badge,
  ListItem,
  Spacer,
  Text,
  downloadJsonAsFile,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { EventCallback } from '@commercelayer/sdk'
import { ArrowCircleDown } from 'phosphor-react'
import type { FC } from 'react'

interface ListItemEventCallbackProps {
  resource?: EventCallback
  isLoading?: boolean
  delayMs?: number
}

export const ListItemEvenCallback: FC<ListItemEventCallbackProps> = ({
  resource = makeEventCallback()
}) => {
  const { user } = useTokenProvider()
  const eventCallbackStatusVariantVariant = eventCallbackStatusVariant(resource)

  const firedAt = ` · ${
    formatDateAndTime(resource.created_at, user?.timezone).date
  } · ${formatDateAndTime(resource.created_at, user?.timezone).time}`

  return (
    <ListItem alignItems='center'>
      <div className='flex gap-1 items-center'>
        <Spacer right='2'>
          <Badge variant={eventCallbackStatusVariantVariant}>
            {resource.response_code ?? ''}
          </Badge>
        </Spacer>
        <Text weight='bold' size='small'>
          {resource.response_message}
        </Text>
        <Text weight='medium' size='small' variant='info'>
          {firedAt}
        </Text>
      </div>
      <div>
        <a
          onClick={() => {
            downloadJsonAsFile({
              json: resource.payload ?? undefined,
              filename: `${resource.id}.json`
            })
          }}
        >
          <ArrowCircleDown size={22} />
        </a>
      </div>
    </ListItem>
  )
}
