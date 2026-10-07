import {
  flatSelectValues,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import { useEffect, useState } from "react"
import { ResourceFinder } from "#components/Form/ResourceFinder"
import type { CustomersField, CustomersFilters, FilterValue } from "../types"

interface Props {
  onChange: (filters: CustomersFilters) => void
}

export function Customers({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<CustomersFilters>({})

  useEffect(
    function dispatchFilterChange() {
      onChange(filters)
    },
    [filters],
  )

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: CustomersField, value: FilterValue): void => {
    setFilter((state) => ({
      ...state,
      [key]: value,
    }))
  }

  return (
    <div>
      <ResourceFinder
        label="Tags"
        resourceType="tags"
        isMulti
        onSelect={(values) => {
          updateFilters("tags_id_in", flatSelectValues(values))
        }}
        sdkClient={sdkClient}
      />
    </div>
  )
}
