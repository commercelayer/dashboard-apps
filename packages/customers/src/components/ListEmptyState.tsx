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

  if (scope === 'presetView') {
    return (
      <EmptyState
        title='No customers yet!'
        description={
          canUser('create', 'customers') && 'Create your first customer'
        }
        action={
          canUser('create', 'customers') && (
            <Link href={appRoutes.new.makePath()}>
              <Button variant='primary'>New customer</Button>
            </Link>
          )
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No customers found!'
        description={
          <div>
            <p>
              We didn't find any customers matching the current filters
              selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No customers yet!'
      description={
        <div>
          <p>Add a customer with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/customers'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
