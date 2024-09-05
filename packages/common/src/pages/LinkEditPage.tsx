import {
  Button,
  EmptyState,
  goBack,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'

import type { Link, LinkUpdate, Sku, SkuList } from '@commercelayer/sdk'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { LinkForm, type LinkFormValues } from '../components/LinkForm'
import { linksRoutes } from '../data/routes'
import { useLinkDetails } from '../hooks/useLinkDetails'
import { isMock } from '../mocks'

interface Props {
  resourceId: Sku['id'] | SkuList['id']
  resourceType: 'skus' | 'sku_lists'
  linkId: Link['id']
}

export const LinkEditPage = ({
  resourceId,
  resourceType,
  linkId
}: Props): JSX.Element => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const goBackUrl = linksRoutes.linksDetails.makePath({
    resourceId,
    linkId
  })
  const { link, isLoading, mutateLink } = useLinkDetails(linkId)

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

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
            resourceType='skus'
            apiError={apiError}
            isSubmitting={isSaving}
            defaultValues={adaptLinkToFormValues(link)}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const link = adaptFormValuesToLink(
                formValues,
                resourceId,
                resourceType
              )
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
  resourceId: Props['resourceId'],
  resourceType: Props['resourceType']
): LinkUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    client_id: formValues.clientId,
    scope: `market:id:${formValues.market}`,
    starts_at: formValues.startsAt.toJSON(),
    expires_at: formValues.expiresAt.toJSON(),
    item: {
      type: resourceType,
      id: resourceId
    }
  }
}
