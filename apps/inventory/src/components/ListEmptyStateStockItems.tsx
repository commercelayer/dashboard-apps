import { appRoutes } from '#data/routes'
import {
  A,
  Button,
  EmptyState,
  useTokenProvider
} from '@commercelayer/app-elements'

import { Link, useRoute } from 'wouter'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyStateStockItems({
  scope = 'history'
}: Props): JSX.Element {
  const { canUser } = useTokenProvider()

  const [, paramsNewStockItem] = useRoute<{ stockLocationId: string }>(
    appRoutes.newStockItem.path
  )
  const [, paramsNewStockLocation] = useRoute<{ stockLocationId: string }>(
    appRoutes.stockLocation.path
  )

  const stockLocationId =
    paramsNewStockItem?.stockLocationId ??
    paramsNewStockLocation?.stockLocationId ??
    ''

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No stock items found!'
        description={
          <div>
            <p>We didn't find any stock item matching the current search.</p>
          </div>
        }
      />
    )
  }

  if (canUser('create', 'stock_items')) {
    return (
      <EmptyState
        title='No stock items yet!'
        description='Create your first stock item'
        action={
          <Link href={appRoutes.newStockItem.makePath(stockLocationId)}>
            <Button variant='primary'>New stock item</Button>
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No stock items yet!'
      description={
        <div>
          <p>Add a stock item with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/stock_items'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
