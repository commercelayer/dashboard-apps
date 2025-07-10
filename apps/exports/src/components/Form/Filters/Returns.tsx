import {
  InputDateRange,
  InputSelect,
  Spacer,
  flatSelectValues,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import {
  type FilterValue,
  type ReturnsField,
  type ReturnsFilters
} from 'AppForm'
import { useEffect, useState } from 'react'
import { parseFilterToDate } from './utils'

interface Props {
  onChange: (filters: ReturnsFilters) => void
}

export function Returns({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const [filters, setFilter] = useState<ReturnsFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: ReturnsField, value: FilterValue): void => {
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
        <InputSelect
          label='Status'
          initialValues={[
            {
              value: 'requested',
              label: 'Requested'
            },
            {
              value: 'approved',
              label: 'Approved'
            },
            {
              value: 'cancelled',
              label: 'Cancelled'
            },
            {
              value: 'shipped',
              label: 'Shipped'
            },
            {
              value: 'rejected',
              label: 'Rejected'
            },
            {
              value: 'received',
              label: 'Received'
            },
            {
              value: 'refunded',
              label: 'Refunded'
            }
          ]}
          isMulti
          onSelect={(values) => {
            updateFilters('status_in', flatSelectValues(values))
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
        timezone={user?.timezone}
      />
    </div>
  )
}
