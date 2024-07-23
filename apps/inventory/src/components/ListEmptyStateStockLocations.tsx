import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyStateStockLocations({
  scope = 'history'
}: Props): JSX.Element {
  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No stock locations found!'
        description={
          <div>
            <p>
              We didn't find any stock location matching the current search.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No stock locations yet!'
      description={
        <div>
          <p>Add a stock locations with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/stock_locations'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
