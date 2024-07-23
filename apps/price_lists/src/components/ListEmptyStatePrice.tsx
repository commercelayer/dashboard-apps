import { appRoutes } from '#data/routes'
import {
  A,
  Button,
  EmptyState,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation, useRoute } from 'wouter'

export const ListEmptyStatePrice: FC = () => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const [, params] = useRoute<{ priceListId: string }>(
    appRoutes.pricesList.path
  )
  const priceListId = params?.priceListId ?? ''

  if (canUser('create', 'prices')) {
    return (
      <EmptyState
        title='No Prices yet!'
        description='Create your first Price'
        action={
          <Button
            variant='primary'
            onClick={() => {
              setLocation(appRoutes.priceNew.makePath({ priceListId }))
            }}
          >
            New Price
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No Prices yet!'
      description={
        <div>
          <p>Add a price with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/prices'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
