import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  goBack,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { SkuDescription } from '#components/SkuDescription'
import { StockItemInfo } from '#components/StockItemInfo'
import { appRoutes } from '#data/routes'
import { useStockItemDetails } from '#hooks/useStockItemDetails'
import { useState, type FC } from 'react'

export const StockItemDetails: FC = () => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ stockLocationId: string; stockItemId: string }>(
    appRoutes.stockItem.path
  )

  const stockLocationId = params?.stockLocationId ?? ''
  const stockItemId = params?.stockItemId ?? ''

  const { stockItem, isLoading, error } = useStockItemDetails(stockItemId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleteting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <PageLayout
        title='Stock items'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.stockLocation.makePath(stockLocationId))
          },
          label: 'Stock location',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.stockLocation.makePath(stockLocationId)}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = stockItem?.sku?.name

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'stock_items')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Edit',
        onClick: () => {
          setLocation(
            appRoutes.editStockItem.makePath(stockLocationId, stockItemId)
          )
        }
      }
    ])
  }

  if (canUser('destroy', 'stock_items')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          open()
        }
      }
    ])
  }

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {stockItem?.sku?.code ?? ''}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath:
              appRoutes.stockLocation.makePath(stockLocationId)
          })
        },
        label: 'Stock location',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          {stockItem.sku != null && (
            <Spacer top='14'>
              <SkuDescription sku={stockItem.sku} />
            </Spacer>
          )}
          <Spacer top='14'>
            <StockItemInfo stockItem={stockItem} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'stock_items') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to cancel the stock item related to ${stockItem?.sku?.code} (${stockItem?.sku?.name}) SKU.`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Cancel`,
              icon: 'x'
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleteting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.stock_items
                  .delete(stockItem.id)
                  .then(() => {
                    setLocation(
                      appRoutes.stockLocation.makePath(stockLocationId)
                    )
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete stock item
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
