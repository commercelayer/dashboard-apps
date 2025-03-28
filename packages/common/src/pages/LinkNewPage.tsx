import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'

import type { LinkCreate, Sku, SkuList } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { LinkForm, type LinkFormValues } from '../components/LinkForm'
import { linksRoutes } from '../data/routes'

interface Props {
  resourceId: Sku['id'] | SkuList['id']
  resourceType: 'skus' | 'sku_lists'
  goBackUrl: string
  pageDescription?: string
  defaultName?: string
}

export const LinkNewPage = ({
  resourceId,
  resourceType,
  goBackUrl,
  pageDescription = 'Share the link with your customers and sell directly your products online.',
  defaultName
}: Props): React.JSX.Element => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const pageTitle = 'New link'

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
            resourceType='skus'
            apiError={apiError}
            isSubmitting={isSaving}
            defaultValues={{
              name: defaultName
            }}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const link = adaptFormValuesToLink(
                formValues,
                resourceId,
                resourceType
              )
              void sdkClient.links
                .create(link)
                .then((createdLink) => {
                  if (createdLink != null) {
                    setLocation(
                      linksRoutes.linksDetails.makePath({
                        linkId: createdLink.id,
                        resourceId
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
  resourceId: Props['resourceId'],
  resourceType: Props['resourceType']
): LinkCreate {
  return {
    name: formValues.name,
    client_id: formValues.clientId,
    scope: `market:id:${formValues.market}${!isEmpty(formValues.stockLocation) ? ` stock_location:id:${formValues.stockLocation}` : ''}`,
    starts_at: formValues.startsAt.toJSON(),
    expires_at: formValues.expiresAt.toJSON(),
    item: {
      type: resourceType,
      id: resourceId
    }
  }
}
