import type { FiltersInstructions } from "@commercelayer/app-elements"
import { isEmpty } from "lodash-es"

interface StockItemsInstructionsConfig {
  stockLocationId?: string
}

export const stockItemsInstructions = ({
  stockLocationId,
}: StockItemsInstructionsConfig): FiltersInstructions => {
  const instructions: FiltersInstructions = []
  if (!isEmpty(stockLocationId) && stockLocationId != null) {
    instructions.push({
      label: "Stock location",
      type: "options",
      sdk: {
        predicate: "stock_location_id_in",
        defaultOptions: [stockLocationId],
      },
      hidden: true,
      render: {
        component: "inputToggleButton",
        props: {
          mode: "single",
          options: [{ value: stockLocationId, label: stockLocationId }],
        },
      },
    })
  }

  instructions.push({
    label: "Availability",
    type: "groupedPredicates",
    urlParamKey: "availability",
    render: {
      component: "inputToggleButton",
      props: {
        mode: "single",
        options: [
          {
            value: "in_stock",
            label: "In stock",
            sdk: { predicate: "quantity_gt", value: "0" },
          },
          {
            value: "out_of_stock",
            label: "Out of stock",
            sdk: { predicate: "quantity_eq", value: "0" },
          },
        ],
      },
    },
  })

  instructions.push({
    label: "Search",
    type: "textSearch",
    sdk: {
      predicate: ["sku_code", "sku_name"].join("_or_") + "_i_cont",
    },
    render: {
      component: "searchBar",
    },
  })
  return instructions
}
