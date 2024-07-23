import {
  StockItemForm,
  type StockItemFormValues
} from '#components/StockItemForm'
import { appRoutes } from '#data/routes'
import { useStockItemDetails } from '#hooks/useStockItemDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type StockItemUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function StockItemEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ stockLocationId: string; stockItemId: string }>(
    appRoutes.editStockItem.path
  )
  const stockLocationId = params?.stockLocationId ?? ''
  const stockItemId = params?.stockItemId ?? ''

  const { stockItem, isLoading, mutateStockItem } =
    useStockItemDetails(stockItemId)

  const goBackUrl = appRoutes.stockItem.makePath(stockLocationId, stockItemId)

  if (!canUser('update', 'stock_items')) {
    return (
      <PageLayout
        title='Edit stock item'
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
        <SkeletonTemplate isLoading={isLoading}>
          Edit stock item
        </SkeletonTemplate>
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
        {!isLoading && stockItem != null ? (
          <StockItemForm
            resource={stockItem}
            defaultValues={{
              id: stockItem.id,
              quantity: stockItem.quantity.toString(),
              item: stockItem.sku?.id
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
                .update(stockItem)
                .then((updatedStockItem) => {
                  void mutateStockItem({ ...updatedStockItem })
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

function adaptFormValuesToStockItem(
  formValues: StockItemFormValues,
  stockLocationId: string
): StockItemUpdate {
  return {
    id: formValues.id ?? '',
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
