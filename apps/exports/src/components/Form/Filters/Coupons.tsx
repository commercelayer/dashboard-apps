import { ResourceFinder } from '#components/Form/ResourceFinder'
import {
  flatSelectValues,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import {
  type CouponsField,
  type CouponsFilters,
  type FilterValue
} from 'AppForm'
import { useEffect, useState } from 'react'

interface Props {
  onChange: (filters: CouponsFilters) => void
}

export function Coupons({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<CouponsFilters>({})

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: CouponsField, value: FilterValue): void => {
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
    <>
      <ResourceFinder
        label='Promotion with coupons'
        resourceType='promotions'
        // isMulti
        onSelect={(values) => {
          updateFilters(
            'promotion_rule_promotion_id_eq',
            flatSelectValues(values)
          )
        }}
        sdkClient={sdkClient}
        fields={['id', 'name']}
        fieldForLabel='name'
        fieldForValue='id'
        filters={{
          // In this way we can get all the promotions that have at least one coupon code
          coupon_codes_promotion_rule_created_at_gt: '1970-01-01T00:00:00.000Z'
        }}
      />
    </>
  )
}
