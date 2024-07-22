import { appRoutes } from '#data/routes'
import { usePromotionPermission } from '#hooks/usePromotionPermission'
import { Button, EmptyState } from '@commercelayer/app-elements'
import { Link } from 'wouter'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { canUserManagePromotions } = usePromotionPermission()

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No promotions found!'
        description={
          <div>
            <p>
              We didn't find any promotions matching the current filters
              selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No promotions yet!'
      action={
        canUserManagePromotions('create', 'atLeastOne') && (
          <Link href={appRoutes.newSelectType.makePath({})}>
            <Button variant='primary'>Add promo</Button>
          </Link>
        )
      }
    />
  )
}
