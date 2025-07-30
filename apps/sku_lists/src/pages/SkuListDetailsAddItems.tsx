import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSku } from '#components/ListItemSku'
import { appRoutes, type PageProps } from '#data/routes'
import {
  Button,
  Card,
  EmptyState,
  InputFeedback,
  PageLayout,
  Spacer,
  useCoreApi,
  useCoreSdkProvider,
  useResourceFilters,
  useTokenProvider,
  type FiltersInstructions
} from '@commercelayer/app-elements'
import { useCallback, useState, type FC } from 'react'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export const SkuListDetailsAddItems: FC<
  PageProps<typeof appRoutes.details>
> = ({ params }) => {
  const { canUser } = useTokenProvider()
  const skuListId = params?.skuListId ?? ''

  const { data: skuListItems } = useCoreApi('sku_list_items', 'list', [
    {
      pageSize: 1,
      fields: ['id'],
      filters: { sku_list_id_eq: skuListId }
    }
  ])
  const totalSkuListItems = skuListItems?.meta.recordCount

  const {
    data: skuList,
    isLoading,
    isValidating,
    error
  } = useCoreApi(
    'sku_lists',
    'retrieve',
    totalSkuListItems == null
      ? null
      : [
          skuListId,
          {
            fields: {
              sku_lists: ['sku_list_items'],
              sku_list_items: ['id', 'sku_code']
            },
            include: totalSkuListItems < 100 ? ['sku_list_items'] : []
          }
        ]
  )

  // codes of SKUs already in the list we want to exclude from the list of items to add
  // we limit the number of codes to 100 to avoid performance issues and generate a query that is too long
  const excludedCodes = (skuList?.sku_list_items ?? [])
    ?.map((item) => item?.sku_code ?? '')
    .slice(0, 100)
    .filter((item) => item !== '')

  if (!canUser('update', 'sku_lists') || error != null) {
    return (
      <PageLayout title='Not authorized' scrollToTop>
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  if (isLoading || isValidating || skuList == null) {
    // prevent rendering the inner list when `excludedCodes` is not ready
    return null
  }

  return (
    <SkuListAddItemsInner
      skuListId={skuListId}
      excludedCodes={excludedCodes}
      // force component to re-load inner list when excludedCodes change
      key={excludedCodes.sort().join(',')}
    />
  )
}

const SkuListAddItemsInner: FC<{
  skuListId: string
  excludedCodes: string[]
}> = ({ skuListId, excludedCodes }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const queryString = useSearch()
  const [selected, setSelected] = useState<string[]>([])

  const instructions: FiltersInstructions = [
    {
      label: 'Already selected items',
      type: 'options',
      sdk: {
        predicate: 'code_not_in',
        defaultOptions: excludedCodes
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'single',
          options: []
        }
      }
    },
    {
      label: 'Search',
      type: 'textSearch',
      sdk: {
        predicate: ['name', 'code'].join('_or_') + '_cont'
      },
      render: {
        component: 'searchBar'
      }
    }
  ]

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions
  })

  const [isCreating, setIsCreating] = useState(false)
  const createSkuListItems = useCallback(
    async (selectedItems: string[]) => {
      setIsCreating(true)
      for (const skuId of selectedItems) {
        await sdkClient.sku_list_items.create({
          quantity: 1,
          sku_list: sdkClient.sku_lists.relationship(skuListId),
          sku: sdkClient.skus.relationship(skuId)
        })
      }
      setIsCreating(false)
    },
    [sdkClient, skuListId]
  )

  return (
    <PageLayout
      title=''
      gap='none'
      overlay
      overlayFooter={
        <div>
          {selected.length === 30 && (
            <Spacer bottom='4'>
              <InputFeedback
                variant='warning'
                message="You've reached the limit of 30 SKUs per submission."
              />
            </Spacer>
          )}
          <Button
            variant='primary'
            fullWidth
            onClick={() => {
              void createSkuListItems(selected).then(() => {
                setLocation(appRoutes.details.makePath({ skuListId }))
              })
            }}
            disabled={selected.length === 0 || isCreating}
          >
            {isCreating ? (
              'Adding...'
            ) : (
              <>
                Add SKUs{selected.length > 0 ? ` (${selected.length})` : null}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className='w-full flex items-center gap-4'>
        <div className='flex-1'>
          <SearchWithNav
            onFilterClick={() => {}}
            onUpdate={(qs) => {
              navigate(`?${qs}`, {
                replace: true
              })
            }}
            queryString={queryString}
            hideFiltersNav
            searchBarPlaceholder='search...'
          />
        </div>
        <Spacer top='6' bottom='14'>
          <Button
            onClick={() => {
              setLocation(appRoutes.details.makePath({ skuListId }))
            }}
            variant='link'
          >
            Cancel
          </Button>
        </Spacer>
      </div>
      <Card gap='none'>
        <FilteredList
          type='skus'
          ItemTemplate={(props) => {
            const isSelected =
              props?.resource != null && selected.includes(props.resource.id)
            return (
              <ListItemSku
                onSelect={(resource) => {
                  if (isCreating) {
                    return
                  }
                  if (isSelected) {
                    setSelected((prev) =>
                      prev.filter((id) => id !== resource.id)
                    )
                    return
                  }
                  if (!isSelected && selected.length < 30) {
                    setSelected((prev) => [...prev, resource.id])
                  }
                }}
                isSelected={isSelected}
                {...props}
              />
            )
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'noSKUsFiltered' : 'noSKUs'}
            />
          }
          hideTitle
        />
      </Card>
    </PageLayout>
  )
}
