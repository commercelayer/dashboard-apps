import { makeSku } from '#mocks'
import { Avatar, Spacer, Text } from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  sku: Sku
}

export const SkuDescription: FC<Props> = ({ sku = makeSku() }) => {
  return (
    <div className='border-t border-b'>
      <Spacer top='6' bottom='6'>
        <div className='flex items-center gap-6'>
          <Avatar
            alt={sku.name}
            src={sku.image_url as `https://${string}`}
            size='large'
          />
          <Text variant='info'>{sku.description}</Text>
        </div>
      </Spacer>
    </div>
  )
}
