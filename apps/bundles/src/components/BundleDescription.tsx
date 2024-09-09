import { makeBundle } from '#mocks'
import { Avatar, Spacer, Text } from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  bundle: Bundle
}

export const BundleDescription: FC<Props> = ({ bundle = makeBundle() }) => {
  return (
    <div className='border-t border-b'>
      <Spacer top='6' bottom='6'>
        <div className='flex items-center gap-6'>
          <Avatar
            alt={bundle.name}
            src={bundle.image_url as `https://${string}`}
            size='large'
          />
          <Text variant='info'>{bundle.description}</Text>
        </div>
      </Spacer>
    </div>
  )
}
