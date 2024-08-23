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

import { PriceInfo } from '#components/PriceInfo'
import { PriceTiers } from '#components/PriceTiers'
import { SkuDescription } from '#components/SkuDescription'
import { appRoutes } from '#data/routes'
import { usePriceDetails } from '#hooks/usePriceDetails'
import { useState } from 'react'

export function PriceDetails(): JSX.Element {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ priceListId: string; priceId: string }>(
    appRoutes.priceDetails.path
  )

  const priceListId = params?.priceListId ?? ''
  const priceId = params?.priceId ?? ''

  const { price, isLoading, error, mutatePrice } = usePriceDetails(priceId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <PageLayout
        title='Price lists'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.pricesList.makePath({ priceListId }))
          },
          label: 'Prices',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.pricesList.makePath({ priceListId })}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = price?.sku?.name

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'prices')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Edit',
        onClick: () => {
          setLocation(appRoutes.priceEdit.makePath({ priceListId, priceId }))
        }
      }
    ])
  }

  if (canUser('destroy', 'prices')) {
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
          {price?.sku?.code ?? ''}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.pricesList.makePath({ priceListId })
          })
        },
        label: 'Prices',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          {price.sku != null && (
            <Spacer top='14'>
              <SkuDescription sku={price.sku} />
            </Spacer>
          )}
          <Spacer top='14'>
            <PriceInfo price={price} />
          </Spacer>
          <Spacer top='14'>
            <PriceTiers price={price} mutatePrice={mutatePrice} type='volume' />
          </Spacer>
          <Spacer top='14'>
            <PriceTiers
              price={price}
              mutatePrice={mutatePrice}
              type='frequency'
            />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'prices') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to delete the price related to ${price?.sku?.code} (${price?.sku?.name}) SKU.`}
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
              disabled={isDeleting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.prices
                  .delete(price.id)
                  .then(() => {
                    setLocation(appRoutes.pricesList.makePath({ priceListId }))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete price
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
