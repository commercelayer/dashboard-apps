import { appRoutes } from '#data/routes'
import { A, Button, EmptyState } from '@commercelayer/app-elements'
import { Link, useRoute } from 'wouter'

interface Props {
  scope?: 'noSKUListItems' | 'noSKUs' | 'noSKUsFiltered'
}

export function ListEmptyState({
  scope = 'noSKUListItems'
}: Props): JSX.Element {
  if (scope === 'noSKUsFiltered') {
    return (
      <EmptyState
        title='No SKUs found!'
        description={
          <div>
            <p>
              We didn't find any SKU matching the current filters selection.
            </p>
          </div>
        }
        className='bg-white'
      />
    )
  }
  if (scope === 'noSKUs') {
    return (
      <EmptyState
        title='No SKUS yet!'
        description={
          <div className='bg-white'>
            <p>Add a SKU with the API, or use the CLI.</p>
            <A
              target='_blank'
              href='https://docs.commercelayer.io/core/v/api-reference/skus'
              rel='noreferrer'
            >
              View API reference.
            </A>
          </div>
        }
      />
    )
  }

  const [, params] = useRoute<{ skuListId: string }>(appRoutes.edit.path)
  const skuListId = params?.skuListId ?? ''

  return (
    <EmptyState
      title='No items found in the selected SKU list!'
      action={
        <Link href={appRoutes.edit.makePath({ skuListId })}>
          <Button variant='primary'>Add a SKU</Button>
        </Link>
      }
    />
  )
}
