import { appRoutes } from '#data/routes'
import { Button, EmptyState, PageLayout } from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link } from 'wouter'

export const ErrorNotFound: FC = () => {
  return (
    <PageLayout title='SKUs'>
      <EmptyState
        title='Not found'
        description='We could not find the resource you are looking for.'
        action={
          <Link href={appRoutes.list.makePath({})}>
            <Button variant='primary'>Go Home</Button>
          </Link>
        }
      />
    </PageLayout>
  )
}
