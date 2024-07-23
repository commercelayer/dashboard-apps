import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  InputDateRange,
  InputSelect,
  Spacer,
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import {
  type OrderSubscriptionField,
  type OrderSubscriptionsFilters,
  type FilterValue
} from 'AppForm'
import { useEffect, useState } from 'react'
import { parseFilterToDate } from './utils'

interface Props {
  onChange: (filters: OrderSubscriptionsFilters) => void
}

export function OrderSubscriptions({ onChange }: Props): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<OrderSubscriptionsFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (
    key: OrderSubscriptionField,
    value: FilterValue
  ): void => {
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
              value: 'inactive',
              label: 'Inactive'
            },
            {
              value: 'active',
              label: 'Active'
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

      <Spacer bottom='6'>
        <InputSelect
          label='Frequency'
          initialValues={[
            {
              value: 'hourly',
              label: 'Hourly'
            },
            {
              value: 'daily',
              label: 'Daily'
            },
            {
              value: 'weekly',
              label: 'Weekly'
            },
            {
              value: 'monthly',
              label: 'Monthly'
            },
            {
              value: 'two-month',
              label: '2-Month'
            },
            {
              value: 'three-month',
              label: '3-Month'
            },
            {
              value: 'four-month',
              label: '4-Month'
            },
            {
              value: 'six-month',
              label: '6-Month'
            },
            {
              value: 'yearly',
              label: 'Yearly'
            }
          ]}
          isMulti
          onSelect={(values) => {
            updateFilters('frequency_in', flatSelectValues(values))
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
