import { PriceForm, type PriceFormValues } from '#components/PriceForm'
import { appRoutes } from '#data/routes'
import { usePriceDetails } from '#hooks/usePriceDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type PriceUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function PriceEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ priceListId: string; priceId: string }>(
    appRoutes.priceEdit.path
  )
  const priceListId = params?.priceListId ?? ''
  const priceId = params?.priceId ?? ''

  const { price, isLoading, mutatePrice } = usePriceDetails(priceId)
  const pageTitle = 'Edit price'

  const goBackUrl = appRoutes.priceDetails.makePath({ priceListId, priceId })

  if (!canUser('update', 'prices')) {
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
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
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
        {!isLoading && price != null ? (
          <PriceForm
            resource={price}
            defaultValues={{
              id: price.id,
              currency_code: price.currency_code?.toString(),
              price: price.amount_cents,
              original_price: price.compare_at_amount_cents ?? 0,
              item: price.sku?.id
            }}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const price = adaptFormValuesToPrice(formValues, priceListId)
              void sdkClient.prices
                .update(price)
                .then((updatedPrice) => {
                  void mutatePrice({ ...updatedPrice })
                  setLocation(goBackUrl)
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

function adaptFormValuesToPrice(
  formValues: PriceFormValues,
  priceListId: string
): PriceUpdate {
  return {
    id: formValues.id ?? '',
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
