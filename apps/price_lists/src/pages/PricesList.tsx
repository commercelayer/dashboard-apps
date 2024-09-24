import { ListEmptyStatePrice } from '#components/ListEmptyStatePrice'
import { ListItemPrice } from '#components/ListItemPrice'
import { pricesFilterInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import {
  Button,
  EmptyState,
  Icon,
  PageLayout,
  SkeletonTemplate,
  useCoreSdkProvider,
  useOverlay,
  useResourceFilters,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function PricesList(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()

  const [, params] = useRoute<{ priceListId: string }>(
    appRoutes.pricesList.path
  )

  const priceListId = params?.priceListId ?? ''

  const { priceList, isLoading, error } = usePriceListDetails(priceListId)

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList } = useResourceFilters({
    instructions: pricesFilterInstructions({ priceListId })
  })

  const { sdkClient } = useCoreSdkProvider()
  const { Overlay, open, close } = useOverlay()
  const [isDeleteting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <PageLayout
        title='Price lists'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: 'Price lists',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'price_lists')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Edit',
        onClick: () => {
          setLocation(
            appRoutes.priceListEdit.makePath({ priceListId: priceList.id })
          )
        }
      }
    ])
  }

  if (canUser('destroy', 'price_lists')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          open()
        }
      }
    ])
  }

  const pageTitle = priceList.name

  if (!canUser('read', 'price_lists') || !canUser('read', 'prices')) {
    return (
      <PageLayout title='Price lists' mode={mode}>
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: 'Price lists',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs: any) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={() => {}}
        hideFiltersNav
      />

      <FilteredList
        type='prices'
        query={{
          include: ['sku', 'price_volume_tiers', 'price_frequency_tiers'],
          sort: {
            created_at: 'desc'
          }
        }}
        actionButton={
          canUser('create', 'prices') && (
            <Link href={appRoutes.priceNew.makePath({ priceListId })} asChild>
              <Button
                variant='secondary'
                size='mini'
                alignItems='center'
                aria-label='Add price'
              >
                <Icon name='plus' />
                Price
              </Button>
            </Link>
          )
        }
        ItemTemplate={ListItemPrice}
        emptyState={<ListEmptyStatePrice />}
      />
      {canUser('destroy', 'price_lists') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to delete the price list with name ${priceList.name}.`}
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
                void sdkClient.price_lists
                  .delete(priceList.id)
                  .then(() => {
                    setLocation(appRoutes.home.makePath({}))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete price list
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
