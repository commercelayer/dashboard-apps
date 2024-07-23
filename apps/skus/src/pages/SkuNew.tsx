import {
  SkuForm,
  isValidUnitOfWeight,
  type SkuFormValues
} from '#components/SkuForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type SkuCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function SkuNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath({})

  if (!canUser('create', 'skus')) {
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
      title={<>New SKU</>}
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
        <SkuForm
          defaultValues={{
            unitOfWeight: 'gr'
          }}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const sku = adaptFormValuesToSku(formValues)
            void sdkClient.skus
              .create(sku)
              .then(() => {
                setLocation(goBackUrl)
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

function adaptFormValuesToSku(formValues: SkuFormValues): SkuCreate {
  /*
   * Note: `unit of weight` field will be sent as `undefined` if the `weight` field is not a positive number
   */
  const refinedUnitOfWeight =
    parseInt(formValues.weight ?? '') > 0 &&
    formValues.unitOfWeight != null &&
    formValues.unitOfWeight?.length > 0 &&
    isValidUnitOfWeight(formValues.unitOfWeight)
      ? formValues.unitOfWeight
      : undefined

  return {
    code: formValues.code,
    name: formValues.name,
    description: formValues.description,
    shipping_category: {
      id: formValues.shippingCategory ?? null,
      type: 'shipping_categories'
    },
    weight: parseInt(formValues.weight ?? ''),
    unit_of_weight: refinedUnitOfWeight,
    pieces_per_pack: parseInt(formValues.piecesPerPack ?? ''),
    hs_tariff_number: formValues.hsTariffNumber,
    do_not_ship: formValues.doNotShip,
    do_not_track: formValues.doNotTrack
  }
}
