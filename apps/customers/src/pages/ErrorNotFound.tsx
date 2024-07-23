import { appRoutes } from '#data/routes'
import { Button, EmptyState, PageLayout } from '@commercelayer/app-elements'
import { Link } from 'wouter'

export function ErrorNotFound(): JSX.Element {
  return (
    <PageLayout title='Customers'>
      <EmptyState
        title='Not found'
        description='We could not find the resource you are looking for.'
        action={
          <Link href={appRoutes.list.makePath()}>
            <Button variant='primary'>Go Home</Button>
          </Link>
        }
      />
    </PageLayout>
  )
}
