import { LinkForm, type LinkFormValues } from '#components/LinkForm'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type LinkCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const skuId = props.params?.skuId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuId })
  const { sku, isLoading } = useSkuDetails(skuId)

  const pageTitle = 'Create link'
  const pageDescription =
    isLoading || isMockedId(sku.id)
      ? null
      : `Create a link to a microstore to directly sell ${sku.name}.`

  return (
    <PageLayout
      title={pageTitle}
      description={pageDescription}
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      toolbar={{
        buttons: [
          {
            label: 'View archive',
            icon: 'archive',
            size: 'small',
            variant: 'secondary',
            onClick: () => {
              setLocation(appRoutes.linksList.makePath({ skuId }))
            }
          }
        ]
      }}
      scrollToTop
      overlay
    >
      {!canUser('create', 'links') ? (
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      ) : (
        <Spacer bottom='14'>
          <LinkForm
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const link = adaptFormValuesToLink(formValues, skuId)
              void sdkClient.links
                .create(link)
                .then((createdLink) => {
                  if (createdLink != null) {
                    setLocation(
                      appRoutes.linksDetails.makePath({
                        linkId: createdLink.id,
                        skuId
                      })
                    )
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

function adaptFormValuesToLink(
  formValues: LinkFormValues,
  skuId: string
): LinkCreate {
  return {
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
