import { Avatar, Spacer, Text } from '@commercelayer/app-elements'
import type { Bundle, Sku } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import type { FC } from 'react'

interface Props {
  resource: Sku | Bundle
}

export const SkuDescription: FC<Props> = ({ resource }) => {
  return (
    (!isEmpty(resource.image_url) || !isEmpty(resource.image_url)) && (
      <div className='border-t border-b'>
        <Spacer top='6' bottom='6'>
          <div className='flex items-center gap-6'>
            <Avatar
              alt={resource.name}
              src={resource.image_url as `https://${string}`}
              size='large'
            />
            <Text variant='info'>{resource.description}</Text>
          </div>
        </Spacer>
      </div>
    )
  )
}
