import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  InputDateRange,
  InputSelect,
  Spacer,
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { type FilterValue, type OrdersField, type OrdersFilters } from 'AppForm'
import { useEffect, useState } from 'react'
import { parseFilterToDate } from './utils'

interface Props {
  onChange: (filters: OrdersFilters) => void
}

export function Orders({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<OrdersFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: OrdersField, value: FilterValue): void => {
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
          label='Markets'
          resourceType='markets'
          isMulti
          onSelect={(values) => {
            updateFilters('market_id_in', flatSelectValues(values))
          }}
          sdkClient={sdkClient}
        />
      </Spacer>

      <Spacer bottom='6'>
        <InputSelect
          label='Status'
          initialValues={[
            {
              value: 'draft',
              label: 'Draft'
            },
            {
              value: 'placed',
              label: 'Placed'
            },
            {
              value: 'pending',
              label: 'Pending'
            },
            {
              value: 'editing',
              label: 'Editing'
            },
            {
              value: 'approved',
              label: 'Approved'
            },
            {
              value: 'cancelled',
              label: 'Cancelled'
            }
          ]}
          isMulti
          onSelect={(values) => {
            updateFilters('status_in', flatSelectValues(values))
          }}
        />
      </Spacer>

      <InputDateRange
        label='Placed date range'
        value={[
          parseFilterToDate(filters.placed_at_gteq),
          parseFilterToDate(filters.placed_at_lteq)
        ]}
        onChange={([from, to]) => {
          updateFilters('placed_at_gteq', from?.toISOString() ?? null)
          updateFilters('placed_at_lteq', to?.toISOString() ?? null)
        }}
        autoPlaceholder
        isClearable
      />
    </div>
  )
}
