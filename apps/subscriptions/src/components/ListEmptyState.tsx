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
        title='No subscriptions found!'
        description={
          <div>
            <p>We didn't find any subscription matching the current search.</p>
          </div>
        }
      />
    )
  }

  if (canUser('create', 'order_subscriptions')) {
    return (
      <EmptyState
        title='No subscriptions yet!'
        description='Create your first subscription'
        action={
          <Link href='#'>
            <Button variant='primary'>New subscription</Button>
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No subscriptions yet!'
      description={
        <div>
          <p>Add a subscription with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/order_subscriptions'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
