import {
  PriceListForm,
  type PriceListFormValues
} from '#components/PriceListForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type PriceListCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function PriceListNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.home.makePath({})

  if (!canUser('create', 'price_lists')) {
    return (
      <PageLayout
        title='New price list'
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
      title={<>New price list</>}
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
        <PriceListForm
          defaultValues={{}}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const priceList = adaptFormValuesToPriceList(formValues)
            void sdkClient.price_lists
              .create(priceList)
              .then((createdPriceList) => {
                setLocation(
                  appRoutes.pricesList.makePath({
                    priceListId: createdPriceList.id
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

function adaptFormValuesToPriceList(
  formValues: PriceListFormValues
): PriceListCreate {
  return {
    name: formValues.name,
    currency_code: formValues.currency_code,
    tax_included: formValues.tax_included === 'true'
  }
}
