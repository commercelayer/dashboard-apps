import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  Spacer,
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { type FilterValue, type PricesFilters, type PricesField } from 'AppForm'
import { useEffect, useState } from 'react'

interface Props {
  onChange: (filters: PricesFilters) => void
}

export function Prices({ onChange }: Props): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<PricesFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: PricesField, value: FilterValue): void => {
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
      <Spacer bottom='6'>
        <ResourceFinder
          label='SKU codes'
          resourceType='skus'
          isMulti
          onSelect={(values) => {
            updateFilters('sku_code_in', flatSelectValues(values))
          }}
          sdkClient={sdkClient}
          fields={['id', 'name', 'code']}
          fieldForLabel='code'
          fieldForValue='code'
        />
      </Spacer>

      <ResourceFinder
        label='Price list'
        resourceType='price_lists'
        onSelect={(values) => {
          updateFilters('price_list_id_eq', flatSelectValues(values))
        }}
        sdkClient={sdkClient}
      />
    </div>
  )
}
