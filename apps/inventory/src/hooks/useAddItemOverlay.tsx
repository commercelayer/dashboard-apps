import { ListEmptyStateSKUs } from '#components/ListEmptyStateSKUs'
import { ListItemSku } from '#components/ListItemSku'
import {
  Card,
  PageLayout,
  useOverlay,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import type { Sku } from '@commercelayer/sdk'
import { useState } from 'react'
import { navigate, useSearch } from 'wouter/use-browser-location'

interface OverlayHook {
  show: ({
    type,
    excludedId
  }: {
    type: 'skus' | 'bundles'
    excludedId?: string
  }) => void
  Overlay: React.FC<{ onConfirm: (resource: Sku) => void }>
}

export function useAddItemOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const [excludedId, setExcludedId] = useState<string>()

  return {
    show: ({ excludedId }) => {
      if (excludedId != null) {
        setExcludedId(excludedId)
      }
      open()
    },
    Overlay: ({ onConfirm }) => {
      const instructions: FiltersInstructions = [
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

      if (excludedId != null) {
        instructions.push({
          label: 'Already selected item',
          type: 'options',
          sdk: {
            predicate: 'id_not_eq',
            defaultOptions: [excludedId]
          },
          render: {
            component: 'inputToggleButton',
            props: {
              mode: 'single',
              options: [{ value: excludedId, label: excludedId }]
            }
          }
        })
      }

      const queryString = useSearch()
      const { SearchWithNav, FilteredList, hasActiveFilter } =
        useResourceFilters({
          instructions
        })

      return (
        <OverlayElement backgroundColor='light'>
          <PageLayout
            title='Pick a SKU'
            gap='only-top'
            navigationButton={{
              onClick: () => {
                close()
              },
              label: 'Back',
              icon: 'arrowLeft'
            }}
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
              <div className='mt-4 mb-14'>
                <button
                  onClick={() => {
                    close()
                  }}
                  className='text-primary font-bold rounded px-1 shadow-none !outline-0 !border-0 !ring-0 focus:shadow-focus'
                >
                  Cancel
                </button>
              </div>
            </div>
            <Card gap='none'>
              <FilteredList
                type='skus'
                query={{
                  fields: {
                    customers: [
                      'id',
                      'email',
                      'total_orders_count',
                      'created_at',
                      'updated_at',
                      'customer_group'
                    ]
                  }
                }}
                ItemTemplate={(props) => (
                  <ListItemSku
                    variant='list'
                    onSelect={(resource) => {
                      onConfirm(resource)
                      close()
                      navigate(`?`, {
                        replace: true
                      })
                    }}
                    {...props}
                  />
                )}
                emptyState={
                  <ListEmptyStateSKUs
                    scope={hasActiveFilter ? 'userFiltered' : 'history'}
                  />
                }
                hideTitle
              />
            </Card>
          </PageLayout>
        </OverlayElement>
      )
    }
  }
}
