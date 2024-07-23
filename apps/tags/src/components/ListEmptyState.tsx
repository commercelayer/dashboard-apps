import {
  A,
  Button,
  EmptyState,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

import { appRoutes } from '#data/routes'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { canUser } = useTokenProvider()

  if (scope === 'history') {
    return (
      <EmptyState
        title='No tags yet!'
        description={canUser('create', 'tags') && 'Create your first tag'}
        action={
          canUser('create', 'tags') && (
            <Link href={appRoutes.new.makePath()}>
              <Button variant='primary'>New tag</Button>
            </Link>
          )
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No tags found!'
        description={
          <div>
            <p>
              We didn't find any tags matching the current filters selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No tags yet!'
      description={
        <div>
          <p>Add a tag with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/tags'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
