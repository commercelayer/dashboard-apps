import type { FiltersInstructions } from '@commercelayer/app-elements'

export const filterInstructions: FiltersInstructions = [
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['currency_code', 'name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]

interface PricesFilterInstructionsConfig {
  priceListId: string
}

export const pricesFilterInstructions = ({
  priceListId
}: PricesFilterInstructionsConfig): FiltersInstructions => [
  {
    label: 'Price list',
    type: 'options',
    sdk: {
      predicate: 'price_list_id_in',
      defaultOptions: [priceListId]
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'single',
        options: [{ value: priceListId, label: priceListId }]
      }
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['sku_code'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
