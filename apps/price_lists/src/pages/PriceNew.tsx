import { PriceForm, type PriceFormValues } from '#components/PriceForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type PriceCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function PriceNew(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ priceListId: string }>(appRoutes.priceNew.path)
  const priceListId = params?.priceListId ?? ''

  const pageTitle = 'New price'

  const goBackUrl = appRoutes.pricesList.makePath({ priceListId })

  if (!canUser('create', 'prices')) {
    return (
      <PageLayout
        title={pageTitle}
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
      title={pageTitle}
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      gap='only-top'
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        <PriceForm
          defaultValues={{
            ...(priceListId !== ''
              ? {
                  price_list: priceListId
                }
              : {})
          }}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const price = adaptFormValuesToPrice(formValues, priceListId)
            void sdkClient.prices
              .create(price)
              .then((createdPrice) => {
                setLocation(
                  appRoutes.priceDetails.makePath({
                    priceListId,
                    priceId: createdPrice.id
                  })
                )
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

function adaptFormValuesToPrice(
  formValues: PriceFormValues,
  priceListId: string
): PriceCreate {
  return {
    amount_cents: formValues.price,
    compare_at_amount_cents: formValues.original_price,
    sku: {
      id: formValues.item ?? null,
      type: 'skus'
    },
    price_list: {
      id: formValues.price_list ?? priceListId,
      type: 'price_lists'
    }
  }
}
