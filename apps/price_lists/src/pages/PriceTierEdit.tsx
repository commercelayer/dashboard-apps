import {
  PriceTierForm,
  type PriceTierFormValues
} from '#components/PriceTierForm'
import { appRoutes } from '#data/routes'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import { usePriceTierDetails } from '#hooks/usePriceTierDetails'
import type { PriceTierType } from '#types'
import {
  getPriceTierSdkResource,
  getUpToForForm,
  getUpToFromForm,
  isUpToForFrequencyFormCustom
} from '#utils/priceTiers'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import {
  type PriceFrequencyTier,
  type PriceFrequencyTierUpdate,
  type PriceList,
  type PriceVolumeTier,
  type PriceVolumeTierUpdate
} from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function PriceTierEdit(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [location, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const tierType = location.includes('frequency') ? 'frequency' : 'volume'

  const pathName =
    tierType === 'frequency' ? 'priceFrequencyTierEdit' : 'priceVolumeTierEdit'
  const sdkResource = getPriceTierSdkResource(tierType)

  const [, params] = useRoute<{
    priceListId: string
    priceId: string
    tierId: string
  }>(appRoutes[pathName].path)

  const priceListId = params?.priceListId ?? ''
  const priceId = params?.priceId ?? ''
  const tierId = params?.tierId ?? ''
  const {
    priceList,
    error,
    isLoading: isLoadingPriceList
  } = usePriceListDetails(priceListId)
  const {
    tier,
    isLoading: isLoadingTier,
    error: errorTier,
    mutateTier
  } = usePriceTierDetails(tierId, tierType)

  const pageTitle = 'Edit tier'

  if (error != null || errorTier != null) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          onClick: () => {
            setLocation(
              appRoutes.priceDetails.makePath({ priceListId, priceId })
            )
          },
          label: pageTitle,
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link
              href={appRoutes.priceDetails.makePath({ priceListId, priceId })}
            >
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const goBackUrl = appRoutes.priceDetails.makePath({ priceListId, priceId })

  if (!canUser('update', sdkResource)) {
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
      <SkeletonTemplate isLoading={isLoadingPriceList || isLoadingTier}>
        <Spacer bottom='14'>
          <PriceTierForm
            defaultValues={adaptPriceTierToFormValues(
              tier,
              priceList,
              tierType
            )}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const tier = adaptFormValuesToPriceTier(formValues, priceId)
              void sdkClient[sdkResource]
                .update(tier)
                .then((updatedTier) => {
                  void mutateTier({ ...updatedTier })
                  setLocation(
                    appRoutes.priceDetails.makePath({
                      priceListId,
                      priceId
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
      </SkeletonTemplate>
    </PageLayout>
  )
}

function adaptPriceTierToFormValues(
  tier: PriceFrequencyTier | PriceVolumeTier,
  priceList: PriceList,
  type: PriceTierType
): PriceTierFormValues {
  const isFrequencyCustom = isUpToForFrequencyFormCustom(tier.up_to)
  const frequencyForForm = getUpToForForm(tier.up_to, 'frequency')
  const defaultValues = {
    id: tier.id,
    name: tier.name ?? '',
    up_to: '',
    up_to_days: '',
    currency_code: priceList.currency_code ?? '',
    price: tier.price_amount_cents,
    type
  }

  if (type === 'frequency') {
    defaultValues.up_to = isFrequencyCustom ? 'custom' : frequencyForForm
    defaultValues.up_to_days = isFrequencyCustom ? frequencyForForm : ''
  } else {
    defaultValues.up_to = getUpToForForm(tier.up_to, 'volume')
  }
  return defaultValues
}

function adaptFormValuesToPriceTier(
  formValues: PriceTierFormValues,
  priceId: string
): PriceFrequencyTierUpdate | PriceVolumeTierUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    up_to: getUpToFromForm(formValues),
    price_amount_cents: formValues.price,
    price: {
      id: priceId,
      type: 'prices'
    }
  }
}
