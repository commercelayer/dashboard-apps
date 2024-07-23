import { type PackingFormDefaultValues } from '#data/packingFormSchema'
import type { Shipment, Sku } from '@commercelayer/sdk'
import uniq from 'lodash/uniq'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

export function useSyncFormPackingWeight({
  shipment
}: {
  shipment: Shipment
}): void {
  const { watch, setValue, getValues } =
    useFormContext<PackingFormDefaultValues>()
  useEffect(() => {
    const unitsOfWeight = getAvailableUnitsOfWeight(shipment, getValues())
    const defaultUnitOfWeight =
      unitsOfWeight.length === 1 ? unitsOfWeight[0] : undefined
    const weight = getTotalWeight(shipment, getValues())

    setValue('weight', weight)
    setValue('unitOfWeight', defaultUnitOfWeight)
  }, [watch('items')])
}

/**
 * For empty string or null values, return undefined.
 * Otherwise returns the value
 */
function removeEmptyString<T extends string>(str?: T | null): T | undefined {
  if (str === '' || str == null) {
    return undefined
  }
  return str
}

/**
 * For the selected packing form item, this helper retrieves
 * the SKU found in the shipment stock_line_items
 */
function getSkuFromSelectItem({
  selectedItem,
  shipment
}: {
  selectedItem: PackingFormDefaultValues['items'][number]
  shipment: Shipment
}): Sku | undefined | null {
  return shipment.stock_line_items?.find(
    (stockLineItem) => stockLineItem.id === selectedItem.value
  )?.sku
}

/**
 * Get available units of weight from selected form items
 * This means that we need to find the corresponding sku for each item
 * to get the unit of weight.
 * We then remove empty strings and return an unique array of units of weight found.
 * Examples:
 * ```
 * [undefined, 'gr']
 * ['gr']
 * ['gr', 'oz']
 * ```
 */
function getAvailableUnitsOfWeight(
  shipment: Shipment,
  formValues: PackingFormDefaultValues
): Array<PackingFormDefaultValues['unitOfWeight']> {
  const availableUnitsOfWeight = formValues.items.reduce<
    Array<PackingFormDefaultValues['unitOfWeight']>
  >((acc, item) => {
    const sku = getSkuFromSelectItem({
      selectedItem: item,
      shipment
    })

    return uniq([...acc, removeEmptyString(sku?.unit_of_weight)])
  }, [])

  return availableUnitsOfWeight
}

/**
 * Calculates the total weight from selected packing form items,
 * but only if all selected items have the same unit of weight.
 */
function getTotalWeight(
  shipment: Shipment,
  formValues: PackingFormDefaultValues
): string {
  let totalWeight = 0
  const unitsOfWeight = getAvailableUnitsOfWeight(shipment, formValues)

  if (unitsOfWeight.length > 1) {
    // can't calculate total weight if there are different units of weight
    return ''
  }

  for (const item of formValues.items) {
    const sku = getSkuFromSelectItem({
      selectedItem: item,
      shipment
    })
    if (sku?.weight == null || sku?.weight <= 0) {
      totalWeight = 0
      break
    }

    totalWeight += sku.weight * item.quantity
  }

  return totalWeight > 0 ? totalWeight.toString() : ''
}
