import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  InputDateRange,
  InputSelect,
  Spacer,
  flatSelectValues,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type FilterValue, type OrdersField, type OrdersFilters } from 'AppForm'
import { useEffect, useState } from 'react'
import { parseFilterToDate } from './utils'

interface Props {
  onChange: (filters: OrdersFilters) => void
}

export function Orders({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
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

      <Spacer bottom='6'>
        <InputSelect
          label='Payment status'
          initialValues={[
            {
              value: 'authorized',
              label: 'Authorized'
            },
            {
              value: 'paid',
              label: 'Paid'
            },
            {
              value: 'voided',
              label: 'Voided'
            },
            {
              value: 'refunded',
              label: 'Refunded'
            },
            {
              value: 'partially_paid',
              label: 'Partially paid'
            },
            {
              value: 'partially_voided',
              label: 'Partially voided'
            },
            {
              value: 'partially_authorized',
              label: 'Partially authorized'
            },
            {
              value: 'partially_refunded',
              label: 'Partially refunded'
            },
            {
              value: 'free',
              label: 'Free'
            },
            {
              value: 'unpaid',
              label: 'Unpaid'
            }
          ]}
          isMulti
          onSelect={(values) => {
            updateFilters('payment_status_in', flatSelectValues(values))
          }}
        />
      </Spacer>

      <Spacer bottom='6'>
        <InputSelect
          label='Fulfillment status'
          initialValues={[
            {
              value: 'unfulfilled',
              label: 'Unfulfilled'
            },
            {
              value: 'in_progress',
              label: 'In progress'
            },
            {
              value: 'fulfilled',
              label: 'Fulfilled'
            },
            {
              value: 'not_required',
              label: 'Not required'
            }
          ]}
          isMulti
          onSelect={(values) => {
            updateFilters('fulfillment_status_in', flatSelectValues(values))
          }}
        />
      </Spacer>

      <Spacer bottom='6'>
        <ResourceFinder
          label='Tags'
          resourceType='tags'
          isMulti
          onSelect={(values) => {
            updateFilters('tags_id_in', flatSelectValues(values))
          }}
          sdkClient={sdkClient}
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
        timezone={user?.timezone}
      />
    </div>
  )
}
