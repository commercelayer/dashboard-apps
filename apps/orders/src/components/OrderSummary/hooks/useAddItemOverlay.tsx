import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSkuBundle } from '#components/OrderSummary/ListItemSkuBundle'
import {
  PageHeading,
  Spacer,
  useOverlay,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import type { Bundle, Order, Sku } from '@commercelayer/sdk'
import { useRef } from 'react'
import { navigate, useSearch } from 'wouter/use-browser-location'

type OnConfirm = (resource: Sku | Bundle) => void

interface OverlayHook {
  show: (type: 'skus' | 'bundles', onConfirm?: OnConfirm) => void
  Overlay: React.FC<{ onConfirm?: OnConfirm }>
}

export function useAddItemOverlay(order: Order): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const filterType = useRef<'skus' | 'bundles'>('skus')
  const onConfirm = useRef<OnConfirm | undefined>()

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

  if (filterType.current === 'bundles') {
    instructions.push({
      label: 'Markets',
      type: 'options',
      sdk: {
        predicate: 'market_id_eq',
        defaultOptions: order.market?.id != null ? [order.market?.id] : []
      },
      hidden: true,
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'multi',
          options: []
        }
      }
    })
  }

  return {
    show: (type, onConfirmOption) => {
      filterType.current = type
      onConfirm.current = onConfirmOption
      open()
    },
    Overlay: ({ onConfirm: onConfirmFromOverlay }) => {
      const queryString = useSearch()
      const { SearchWithNav, FilteredList } = useResourceFilters({
        instructions
      })

      return (
        <OverlayElement>
          <PageHeading
            gap='only-top'
            title={filterType.current === 'skus' ? 'Add a SKU' : 'Add a bundle'}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: 'Cancel',
              icon: 'x'
            }}
          />

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

          <Spacer top='14'>
            <FilteredList
              type={filterType.current}
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
                <ListItemSkuBundle
                  onSelect={(resource) => {
                    onConfirm.current?.(resource)
                    onConfirmFromOverlay?.(resource)
                    close()
                    navigate(`?`, {
                      replace: true
                    })
                  }}
                  {...props}
                />
              )}
              emptyState={
                <ListEmptyState
                  scope={filterType.current === 'skus' ? 'noSKUs' : 'noBundles'}
                />
              }
            />
          </Spacer>
        </OverlayElement>
      )
    }
  }
}
