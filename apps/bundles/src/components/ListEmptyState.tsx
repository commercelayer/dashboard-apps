import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No bundles found!'
        description={
          <div>
            <p>We didn't find any bundle matching the current search.</p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No bundles yet!'
      description={
        <div>
          <p>Add a bundle with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/bundles'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
