import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'presetView') {
    return (
      <EmptyState
        title='All good here'
        description={
          <div>
            <p>There are no returns for the current list.</p>
          </div>
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No returns found!'
        description={
          <div>
            <p>
              We didn't find any returns matching the current filters selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No returns yet!'
      description={
        <div>
          <p>Add a return with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/returns'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
