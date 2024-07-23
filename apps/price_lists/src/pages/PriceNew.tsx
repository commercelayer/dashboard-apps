import { PriceForm, type PriceFormValues } from '#components/PriceForm'
import { appRoutes } from '#data/routes'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
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

export function PriceNew(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ priceListId: string }>(appRoutes.priceNew.path)
  const priceListId = params?.priceListId ?? ''

  const { priceList, error } = usePriceListDetails(priceListId)
  const pageTitle = 'New price'

  if (error != null) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: pageTitle,
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

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
            currency_code: priceList.currency_code
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
      id: priceListId,
      type: 'price_lists'
    }
  }
}
