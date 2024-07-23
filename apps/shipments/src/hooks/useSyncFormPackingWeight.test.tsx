import type { PackingFormDefaultValues } from '#data/packingFormSchema'
import { makeShipment, makeSku, makeStockLineItem } from '#mocks'
import type { Shipment } from '@commercelayer/sdk'
import { act, renderHook } from '@testing-library/react'
import { useSyncFormPackingWeight } from './useSyncFormPackingWeight'

const formState: PackingFormDefaultValues = {
  items: [],
  packageId: '',
  weight: ''
}

describe('useSyncFormPackingWeight', () => {
  beforeEach(() => {
    vi.mock('react-hook-form', () => {
      return {
        useFormContext: () => ({
          watch: (key?: keyof PackingFormDefaultValues) => {
            if (key != null) {
              return formState[key]
            }
            return formState
          },
          setValue: (key: keyof PackingFormDefaultValues, value: any) => {
            // @ts-expect-error - this is a mock
            formState[key] = value
          },
          getValues: (): PackingFormDefaultValues => formState
        })
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should keep sync form state when changing selected items', () => {
    const shipment: Shipment = {
      ...makeShipment(),
      stock_line_items: [
        {
          ...makeStockLineItem(),
          id: 'firstLineItem',
          sku: {
            ...makeSku(),
            id: 'sku1',
            unit_of_weight: 'gr',
            weight: 100
          }
        },
        {
          ...makeStockLineItem(),
          id: 'secondLineItem',
          sku: {
            ...makeSku(),
            id: 'sku2',
            unit_of_weight: 'gr',
            weight: 150
          }
        }
      ]
    }

    const { rerender } = renderHook(() => {
      useSyncFormPackingWeight({ shipment })
    })

    // all items are selected
    act(() => {
      formState.items = [
        {
          value: 'firstLineItem',
          quantity: 4
        },
        {
          value: 'secondLineItem',
          quantity: 2
        }
      ]
      rerender()
    })
    expect(formState.weight).toBe('700')
    expect(formState.unitOfWeight).toBe('gr')

    // select only one item and change its quantity
    act(() => {
      formState.items = [
        {
          value: 'firstLineItem',
          quantity: 3
        }
      ]
      rerender()
    })
    expect(formState.weight).toBe('300') // 3 items * 100gr
    expect(formState.unitOfWeight).toBe('gr')
  })

  test('should calculate total weight only if all selected items have a weight and unit_of_weight', () => {
    const shipment: Shipment = {
      ...makeShipment(),
      stock_line_items: [
        {
          ...makeStockLineItem(),
          id: 'firstLineItem',
          sku: {
            ...makeSku(),
            id: 'sku1',
            unit_of_weight: null
          }
        },
        {
          ...makeStockLineItem(),
          id: 'secondLineItem',
          sku: {
            ...makeSku(),
            id: 'sku2',
            unit_of_weight: 'gr',
            weight: 250
          }
        }
      ]
    }

    const { rerender } = renderHook(() => {
      useSyncFormPackingWeight({ shipment })
    })

    // all items are selected
    act(() => {
      formState.items = [
        {
          value: 'firstLineItem',
          quantity: 4
        },
        {
          value: 'secondLineItem',
          quantity: 2
        }
      ]
      rerender()
    })
    // expecting empty values because the first item has no weight
    expect(formState.weight).toBe('')
    expect(formState.unitOfWeight).toBe(undefined)

    // select only the item that has a weight set
    act(() => {
      formState.items = [
        {
          value: 'secondLineItem',
          quantity: 2
        }
      ]
      rerender()
    })
    expect(formState.weight).toBe('500') // 3 items * 100gr
    expect(formState.unitOfWeight).toBe('gr')
  })
})
