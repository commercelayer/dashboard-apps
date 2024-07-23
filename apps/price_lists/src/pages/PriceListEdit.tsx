/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  PriceListForm,
  type PriceListFormValues
} from '#components/PriceListForm'
import { appRoutes } from '#data/routes'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type PriceList, type PriceListUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function PriceListEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ priceListId: string }>(
    appRoutes.priceListEdit.path
  )
  const priceListId = params?.priceListId ?? ''

  const { priceList, isLoading, mutatePriceList } =
    usePriceListDetails(priceListId)
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl =
    priceListId != null
      ? appRoutes.pricesList.makePath({ priceListId })
      : appRoutes.home.makePath({})

  if (!canUser('update', 'price_lists')) {
    return (
      <PageLayout
        title='Edit price list'
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
          title='Not found'
          description='Price list is invalid or you are not authorized to access this page.'
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
        <SkeletonTemplate isLoading={isLoading}>
          Edit price list
        </SkeletonTemplate>
      }
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
        {!isLoading && priceList != null ? (
          <PriceListForm
            defaultValues={adaptPriceListToFormValues(priceList)}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.price_lists
                .update(adaptFormValuesToPriceList(formValues))
                .then((updatedPriceList) => {
                  setLocation(goBackUrl)
                  void mutatePriceList({ ...updatedPriceList })
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

function adaptPriceListToFormValues(
  priceList?: PriceList
): PriceListFormValues {
  return {
    id: priceList?.id,
    name: priceList?.name ?? '',
    currency_code: priceList?.currency_code ?? '',
    tax_included: priceList?.tax_included?.toString() ?? ''
  }
}

function adaptFormValuesToPriceList(
  formValues: PriceListFormValues
): PriceListUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    currency_code: formValues.currency_code,
    tax_included: formValues.tax_included === 'true'
  }
}
