import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyStateSKUs({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'userFiltered') {
    return (
      <EmptyState
        className='bg-white'
        title='No SKUs found!'
        description={
          <div>
            <p>We didn't find any SKU matching the current search.</p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      className='bg-white'
      title='No SKUs yet!'
      description={
        <div>
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
