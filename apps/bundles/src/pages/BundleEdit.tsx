/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { BundleForm, type BundleFormValues } from '#components/BundleForm'
import { appRoutes } from '#data/routes'
import { useBundleDetails } from '#hooks/useBundleDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Bundle, type BundleUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function BundleEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ bundleId: string }>(appRoutes.edit.path)
  const bundleId = params?.bundleId ?? ''

  const { bundle, isLoading, mutateBundle } = useBundleDetails(bundleId)
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl =
    bundleId != null
      ? appRoutes.details.makePath({ bundleId })
      : appRoutes.list.makePath({})

  if (!canUser('update', 'bundles')) {
    return (
      <PageLayout
        title='Edit bundle'
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
          description='Bundle is invalid or you are not authorized to access this page.'
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
        <SkeletonTemplate isLoading={isLoading}>Edit bundle</SkeletonTemplate>
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
        {!isLoading && bundle != null ? (
          <BundleForm
            defaultValues={adaptBundleToFormValues(bundle)}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.bundles
                .update(adaptFormValuesToBundle(formValues) as Bundle)
                .then((updatedBundle) => {
                  setLocation(goBackUrl)
                  void mutateBundle({ ...updatedBundle })
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

function adaptBundleToFormValues(bundle?: Bundle): BundleFormValues {
  return {
    id: bundle?.id,
    code: bundle?.code ?? '',
    name: bundle?.name ?? '',
    description: bundle?.description ?? '',
    image_url: bundle?.image_url ?? '',
    sku_list: bundle?.sku_list?.id ?? '',
    market: bundle?.market?.id ?? '',
    currency_code: bundle?.currency_code ?? '',
    price: bundle?.price_amount_cents ?? 0,
    original_price: bundle?.compare_at_amount_cents ?? 0
  }
}

function adaptFormValuesToBundle(formValues: BundleFormValues): BundleUpdate {
  return {
    id: formValues.id ?? '',
    code: formValues.code,
    name: formValues.name,
    description: formValues.description,
    image_url: formValues.image_url,
    currency_code: formValues.currency_code,
    price_amount_cents: formValues.price,
    compare_at_amount_cents: formValues.original_price
  }
}
