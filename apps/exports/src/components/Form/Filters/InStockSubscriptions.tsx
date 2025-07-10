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
  type InStockSubscriptionsField,
  type InStockSubscriptionsFilters
} from 'AppForm'
import { useEffect, useState } from 'react'
import { parseFilterToDate } from './utils'

interface Props {
  onChange: (filters: InStockSubscriptionsFilters) => void
}

export function InStockSubscriptions({
  onChange
}: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const [filters, setFilter] = useState<InStockSubscriptionsFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (
    key: InStockSubscriptionsField,
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
        <InputSelect
          label='Status'
          initialValues={[
            {
              value: 'active',
              label: 'Active'
            },
            {
              value: 'inactive',
              label: 'Inactive'
            },
            {
              value: 'notified',
              label: 'Notified'
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
