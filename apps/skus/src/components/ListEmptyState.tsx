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

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { canUser } = useTokenProvider()

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No SKUs found!'
        description={
          <div>
            <p>We didn't find any SKU matching the current search.</p>
          </div>
        }
      />
    )
  }

  if (canUser('create', 'skus')) {
    return (
      <EmptyState
        title='No SKUs yet!'
        description='Create your first SKU'
        action={
          <Link href={appRoutes.new.makePath({})}>
            <Button variant='primary'>New SKU</Button>
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
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
