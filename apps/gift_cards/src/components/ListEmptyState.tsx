import { appRoutes } from '#data/routes'
import {
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
        title='No gift card found!'
        description={
          <div>
            <p>
              We didn't find any gift card matching the current filters
              selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No gift card yet!'
      action={
        canUser('create', 'gift_cards') && (
          <Link href={appRoutes.new.makePath({})}>
            <Button variant='primary'>Add gift card</Button>
          </Link>
        )
      }
    />
  )
}
