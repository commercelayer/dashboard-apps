/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ScrollToTop } from '#components/ScrollToTop'
import { TagForm, type TagFormValues } from '#components/TagForm'
import { appRoutes } from '#data/routes'
import { useTagDetails } from '#hooks/useTagDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Tag, type TagUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function TagEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ tagId: string }>(appRoutes.edit.path)
  const tagId = params?.tagId ?? ''

  const { tag, isLoading, mutateTag } = useTagDetails(tagId)
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath()

  if (!canUser('update', 'tags')) {
    return (
      <PageLayout
        title='Edit tag'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title='Not found'
          description='Tag is invalid or you are not authorized to access this page.'
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
      title={
        <SkeletonTemplate isLoading={isLoading}>Edit tag</SkeletonTemplate>
      }
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      overlay
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        {!isLoading && tag != null ? (
          <TagForm
            defaultValues={adaptTagToFormValues(tag)}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.tags
                .update(adaptFormValuesToTag(formValues, tag.id))
                .then((updatedTag) => {
                  setLocation(goBackUrl)
                  void mutateTag({ ...updatedTag })
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptTagToFormValues(tag?: Tag): TagFormValues {
  return {
    name: tag?.name ?? ''
  }
}

function adaptFormValuesToTag(
  formValues: TagFormValues,
  tagId: string
): TagUpdate {
  return {
    id: tagId,
    name: formValues.name
  }
}
