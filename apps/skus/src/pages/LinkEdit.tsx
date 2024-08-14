import { LinkForm, type LinkFormValues } from '#components/LinkForm'
import { appRoutes, type PageProps } from '#data/routes'
import { useLinkDetails } from '#hooks/useLinkDetails'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Link, type LinkUpdate } from '@commercelayer/sdk'
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

  const skuId = props.params?.skuId ?? ''
  const linkId = props.params?.linkId ?? ''
  const goBackUrl = appRoutes.linksDetails.makePath({ skuId, linkId })
  const { link, isLoading, mutateLink } = useLinkDetails(linkId)

  if (!canUser('create', 'links')) {
    return (
      <PageLayout
        title='Edit link'
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: 'Cancel',
          icon: 'x'
        }}
        scrollToTop
        overlay
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Button
              variant='primary'
              onClick={() => {
                setLocation(goBackUrl)
              }}
            >
              Go back
            </Button>
          }
        />
      </PageLayout>
    )
  }

  if (link == null || isLoading || isMock(link)) {
    return <></>
  }

  return (
    <PageLayout
      title={link?.name}
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        <LinkForm
          apiError={apiError}
          isSubmitting={isSaving}
          defaultValues={adaptLinkToFormValues(link)}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const link = adaptFormValuesToLink(formValues, skuId)
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
  skuId: string
): LinkUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    client_id: formValues.clientId,
    scope: `market:id:${formValues.market}`,
    starts_at: formValues.startsAt.toJSON(),
    expires_at: formValues.expiresAt.toJSON(),
    item: {
      type: 'skus',
      id: skuId
    }
  }
}
