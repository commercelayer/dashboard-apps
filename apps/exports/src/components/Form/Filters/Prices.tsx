import {
  flatSelectValues,
  Spacer,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import { useEffect, useState } from "react"
import { ResourceFinder } from "#components/Form/ResourceFinder"
import type { FilterValue, PricesField, PricesFilters } from "../types"

interface Props {
  onChange: (filters: PricesFilters) => void
}

export function Prices({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<PricesFilters>({})

  useEffect(
    function dispatchFilterChange() {
      onChange(filters)
    },
    [filters],
  )

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: PricesField, value: FilterValue): void => {
    setFilter((state) => ({
      ...state,
      [key]: value,
    }))
  }

  return (
    <div>
      <Spacer bottom="6">
        <ResourceFinder
          label="SKU codes"
          resourceType="skus"
          isMulti
          onSelect={(values) => {
            updateFilters("sku_code_in", flatSelectValues(values))
          }}
          sdkClient={sdkClient}
          fields={["id", "name", "code"]}
          fieldForLabel="code"
          fieldForValue="code"
        />
      </Spacer>

      <ResourceFinder
        label="Price list"
        resourceType="price_lists"
        onSelect={(values) => {
          updateFilters("price_list_id_eq", flatSelectValues(values))
        }}
        sdkClient={sdkClient}
      />
    </div>
  )
}
