import {
  StockItemForm,
  type StockItemFormValues
} from '#components/StockItemForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type StockItemCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function StockItemNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ stockLocationId: string }>(
    appRoutes.newStockItem.path
  )

  const stockLocationId = params?.stockLocationId ?? ''

  const goBackUrl = appRoutes.stockLocation.makePath(stockLocationId)

  if (!canUser('create', 'stock_items')) {
    return (
      <PageLayout
        title='New stock item'
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
      title={<>New stock item</>}
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
        <StockItemForm
          defaultValues={{
            quantity: '1'
          }}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const stockItem = adaptFormValuesToStockItem(
              formValues,
              stockLocationId
            )
            void sdkClient.stock_items
              .create(stockItem)
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

function adaptFormValuesToStockItem(
  formValues: StockItemFormValues,
  stockLocationId: string
): StockItemCreate {
  return {
    sku: {
      id: formValues.item ?? null,
      type: 'skus'
    },
    quantity: parseInt(formValues.quantity),
    stock_location: {
      id: stockLocationId,
      type: 'stock_locations'
    }
  }
}
