import { ScrollToTop } from '#components/ScrollToTop'
import { TagForm, type TagFormValues } from '#components/TagForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type TagCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function TagNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath()

  if (!canUser('create', 'tags')) {
    return (
      <PageLayout
        title='New tag'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={<>New tag</>}
      navigationButton={{
        label: 'Tags',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      overlay
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        <TagForm
          defaultValues={newTagToFormValues()}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            void sdkClient.tags
              .create(adaptFormValuesToTag(formValues))
              .then(() => {
                setLocation(goBackUrl)
              })
              .catch((error) => {
                setApiError(error)
                setIsSaving(false)
              })
          }}
        />
      </Spacer>
    </PageLayout>
  )
}

function newTagToFormValues(): TagFormValues {
  return {
    name: ''
  }
}

function adaptFormValuesToTag(formValues: TagFormValues): TagCreate {
  return {
    name: formValues.name
  }
}
