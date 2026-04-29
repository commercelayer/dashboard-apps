import {
  flatSelectValues,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import { useEffect, useState } from "react"
import { ResourceFinder } from "#components/Form/ResourceFinder"
import type { CouponsField, CouponsFilters, FilterValue } from "../types"

interface Props {
  onChange: (filters: CouponsFilters) => void
}

export function Coupons({ onChange }: Props): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const [filters, setFilter] = useState<CouponsFilters>({})

  useEffect(
    function dispatchFilterChange() {
      onChange(filters)
    },
    [filters],
  )

  if (sdkClient == null) {
    return null
  }

  const updateFilters = (key: CouponsField, value: FilterValue): void => {
    setFilter((state) => ({
      ...state,
      [key]: value,
    }))
  }

  return (
    <>
      <ResourceFinder
        label="Promotion with coupons"
        resourceType="promotions"
        onSelect={(values) => {
          updateFilters(
            "promotion_rule_promotion_id_eq",
            flatSelectValues(values),
          )
        }}
        sdkClient={sdkClient}
        fields={["id", "name"]}
        fieldForLabel="name"
        fieldForValue="id"
        filters={{
          coupons_id_not_null: true,
        }}
      />
    </>
  )
}
