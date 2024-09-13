import { BundleForm, type BundleFormValues } from '#components/BundleForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type BundleCreate } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function BundleNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath({})

  if (!canUser('create', 'bundles')) {
    return (
      <PageLayout
        title='New bundle'
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
      title={<>New bundle</>}
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
        <BundleForm
          defaultValues={{
            market: '',
            currency_code: 'USD'
          }}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const bundle = adaptFormValuesToBundle(formValues)
            void sdkClient.bundles
              .create(bundle)
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

function adaptFormValuesToBundle(formValues: BundleFormValues): BundleCreate {
  return {
    code: formValues.code,
    name: formValues.name,
    description: formValues.description,
    image_url: formValues.image_url,
    sku_list: {
      id: formValues.sku_list,
      type: 'sku_lists'
    },
    ...(!isEmpty(formValues.market) && formValues.market != null
      ? {
          market: {
            id: formValues.market,
            type: 'markets'
          }
        }
      : {
          currency_code: formValues.currency_code
        }),
    price_amount_cents: formValues.price,
    compare_at_amount_cents: formValues.original_price
  }
}
