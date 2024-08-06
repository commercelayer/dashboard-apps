import { LinkForm, type LinkFormValues } from '#components/LinkForm'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
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

  const skuListId = props.params?.skuListId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuListId })
  const { skuList } = useSkuListDetails(skuListId)

  if (!canUser('create', 'links')) {
    return (
      <PageLayout
        title='New SKU'
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
      title={<>Create link</>}
      description={
        <>
          Create a link to a microstore to directly sell the SKUs from{' '}
          <strong>{skuList.name}</strong>.
        </>
      }
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
              setLocation(appRoutes.linksList.makePath({ skuListId }))
            }
          }
        ]
      }}
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        <LinkForm
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const link = adaptFormValuesToLink(formValues, skuListId)
            void sdkClient.links
              .create(link)
              .then((createdLink) => {
                if (createdLink != null) {
                  setLocation(
                    appRoutes.linksDetails.makePath({
                      linkId: createdLink.id,
                      skuListId
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
    </PageLayout>
  )
}

function adaptFormValuesToLink(
  formValues: LinkFormValues,
  skuListId: string
): LinkCreate {
  return {
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