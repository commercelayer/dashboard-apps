import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import {
  type FilterValue,
  type StockItemsFilters,
  type StockItemsField
} from 'AppForm'
import { useEffect, useState } from 'react'

interface Props {
  onChange: (filters: StockItemsFilters) => void
}

export function StockItems({ onChange }: Props): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<StockItemsFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: StockItemsField, value: FilterValue): void => {
    setFilter((state) => ({
      ...state,
      [key]: value
    }))
  }

  useEffect(
    function dispatchFilterChange() {
      onChange(filters)
    },
    [filters]
  )

  return (
    <div>
      <ResourceFinder
        label='Stock locations'
        resourceType='stock_locations'
        isMulti
        onSelect={(values) => {
          updateFilters('stock_location_id_in', flatSelectValues(values))
        }}
        sdkClient={sdkClient}
      />
    </div>
  )
}
