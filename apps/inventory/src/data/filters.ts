import type { FiltersInstructions } from '@commercelayer/app-elements'

export const stockLocationsInstructions: FiltersInstructions = [
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]

interface StockItemsInstructionsConfig {
  stockLocationId: string
}

export const stockItemsInstructions = ({
  stockLocationId
}: StockItemsInstructionsConfig): FiltersInstructions => [
  {
    label: 'Stock location',
    type: 'options',
    sdk: {
      predicate: 'stock_location_id_in',
      defaultOptions: [stockLocationId]
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'single',
        options: [{ value: stockLocationId, label: stockLocationId }]
      }
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['sku_code', 'sku_name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
