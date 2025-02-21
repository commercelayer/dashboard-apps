import { appRoutes } from '#data/routes'
import {
  A,
  Button,
  EmptyState,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyState({
  scope = 'history'
}: Props): React.JSX.Element {
  const { canUser } = useTokenProvider()

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

  if (canUser('create', 'bundles')) {
    return (
      <EmptyState
        title='No bundles yet!'
        description='Create your first bundle'
        action={
          <Link href={appRoutes.new.makePath({})}>
            <Button variant='primary'>New bundle</Button>
          </Link>
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
