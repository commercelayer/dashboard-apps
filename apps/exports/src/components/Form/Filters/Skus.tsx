import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  InputDateRange,
  InputToggleButton,
  Spacer,
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { type FilterValue, type SkusField, type SkusFilters } from 'AppForm'
import { useEffect, useState } from 'react'

interface Props {
  onChange: (filters: SkusFilters) => void
}

export function Skus({ onChange }: Props): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<SkusFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: SkusField, value: FilterValue): void => {
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
            updateFilters('code_in', flatSelectValues(values))
          }}
          sdkClient={sdkClient}
          fields={['id', 'name', 'code']}
          fieldForLabel='code'
          fieldForValue='code'
        />
      </Spacer>

      <Spacer bottom='6'>
        <ResourceFinder
          label='Shipping categories'
          resourceType='shipping_categories'
          isMulti
          onSelect={(values) => {
            updateFilters('shipping_category_id_in', flatSelectValues(values))
          }}
          sdkClient={sdkClient}
          fields={['id', 'name']}
          fieldForLabel='name'
          fieldForValue='id'
        />
      </Spacer>

      <Spacer bottom='6'>
        <InputToggleButton
          label='Product Type'
          mode='single'
          options={[
            {
              value: 'true',
              label: 'Shippable SKU'
            },
            {
              value: 'false',
              label: 'Non-shippable SKU'
            }
          ]}
          value={
            filters.do_not_ship_false == null
              ? undefined
              : (filters.do_not_ship_false as string)
          }
          onChange={(value) => {
            updateFilters('do_not_ship_false', value)
          }}
        />
      </Spacer>

      <InputDateRange
        label='Date range'
        value={[
          parseFilterToDate(filters.created_at_gteq),
          parseFilterToDate(filters.created_at_lteq)
        ]}
        onChange={([from, to]) => {
          updateFilters('created_at_gteq', from?.toISOString() ?? null)
          updateFilters('created_at_lteq', to?.toISOString() ?? null)
        }}
        autoPlaceholder
        isClearable
      />
    </div>
  )
}

function parseFilterToDate(filterValue?: FilterValue): Date | null {
  return filterValue != null && typeof filterValue === 'string'
    ? new Date(filterValue)
    : null
}
