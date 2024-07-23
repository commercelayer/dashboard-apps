import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link } from 'wouter'

export const ErrorNotFound: FC = () => {
  const { settings } = useTokenProvider()

  return (
    <PageLayout title='Webhooks' mode={settings.mode}>
      <EmptyState
        title='Not found'
        description='We could not find the resource you are looking for.'
        action={
          <Link href={appRoutes.list.makePath({})}>
            <Button variant='primary'>Go back</Button>
          </Link>
        }
      />
    </PageLayout>
  )
}
