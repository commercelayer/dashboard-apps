import type { FiltersInstructions } from '@commercelayer/app-elements'

interface StockItemsInstructionsConfig {
  stockLocationId?: string
}

export const stockItemsInstructions = ({
  stockLocationId
}: StockItemsInstructionsConfig): FiltersInstructions => {
  const instructions: FiltersInstructions = []
  if (stockLocationId != null)
    instructions.push({
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
    })
  instructions.push({
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['sku_code', 'sku_name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  })
  return instructions
}
