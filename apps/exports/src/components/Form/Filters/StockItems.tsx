import {
  flatSelectValues,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import { useEffect, useState } from "react"
import { ResourceFinder } from "#components/Form/ResourceFinder"
import type { FilterValue, StockItemsField, StockItemsFilters } from "../types"

interface Props {
  onChange: (filters: StockItemsFilters) => void
}

export function StockItems({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<StockItemsFilters>({})

  useEffect(
    function dispatchFilterChange() {
      onChange(filters)
    },
    [filters],
  )

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: StockItemsField, value: FilterValue): void => {
    setFilter((state) => ({
      ...state,
      [key]: value,
    }))
  }

  return (
    <div>
      <ResourceFinder
        label="Stock locations"
        resourceType="stock_locations"
        isMulti
        onSelect={(values) => {
          updateFilters("stock_location_id_in", flatSelectValues(values))
        }}
        sdkClient={sdkClient}
      />
    </div>
  )
}
