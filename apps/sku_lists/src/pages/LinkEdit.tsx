import { appRoutes, type PageProps } from '#data/routes'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  goBack,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Link, type LinkUpdate } from '@commercelayer/sdk'
import {
  LinkForm,
  type LinkFormValues
} from 'dashboard-apps-common/src/components/LinkForm'
import { useLinkDetails } from 'dashboard-apps-common/src/hooks/useLinkDetails'
import { useState } from 'react'
import { useLocation } from 'wouter'

export function LinkEdit(
  props: PageProps<typeof appRoutes.linksEdit>
): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const skuListId = props.params?.skuListId ?? ''
  const linkId = props.params?.linkId ?? ''
  const goBackUrl = appRoutes.linksDetails.makePath({ skuListId, linkId })
  const { link, isLoading, mutateLink } = useLinkDetails(linkId)

  const pageTitle = link?.name ?? 'Edit link'

  if (link == null || isLoading || isMock(link)) {
    return <></>
  }

  return (
    <PageLayout
      title={pageTitle}
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: goBackUrl
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      scrollToTop
      overlay
    >
      {!canUser('update', 'links') ? (
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Button
              variant='primary'
              onClick={() => {
                goBack({
                  setLocation,
                  defaultRelativePath: goBackUrl
                })
              }}
            >
              Go back
            </Button>
          }
        />
      ) : (
        <Spacer bottom='14'>
          <LinkForm
            resourceType='sku_lists'
            apiError={apiError}
            isSubmitting={isSaving}
            defaultValues={adaptLinkToFormValues(link)}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const link = adaptFormValuesToLink(formValues, skuListId)
              void sdkClient.links
                .update(link)
                .then((editedLink) => {
                  if (editedLink != null) {
                    void mutateLink()
                    setLocation(goBackUrl)
                  }
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        </Spacer>
      )}
    </PageLayout>
  )
}

function adaptLinkToFormValues(link?: Link): LinkFormValues {
  return {
    id: link?.id,
    name: link?.name ?? '',
    clientId: link?.client_id ?? '',
    market: link?.scope.replace('market:id:', '') ?? '',
    startsAt: new Date(link?.starts_at ?? ''),
    expiresAt: new Date(link?.expires_at ?? '')
  }
}

function adaptFormValuesToLink(
  formValues: LinkFormValues,
  skuListId: string
): LinkUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    client_id: formValues.clientId,
    scope: `market:id:${formValues.market}`,
    starts_at: formValues.startsAt.toJSON(),
    expires_at: formValues.expiresAt.toJSON(),
    item: {
      type: 'sku_lists',
      id: skuListId
    }
  }
}
