import { isMockedId } from '#mocks'
import type {
  LineItem,
  Order,
  Return,
  ReturnLineItem
} from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useOrderReturns } from './useOrderReturns'

/**
 * This hook is used to obtain a list of `line_items` suitable for being returned for a given `Order`.
 * Order's `returns.return_line_items` are compared to `order.line_items` to find items with a quantity that is not already attached to any of order's returns.
 * @param order - the order attached for which returnable line items will be calculated
 * @returns - an array of `LineItem`
 */
export function useReturnableList(order: Order): LineItem[] {
  const { returns } = useOrderReturns(order.id)

  return useMemo(() => {
    if (!isMockedId(order.id)) {
      const returnLineItemsFromReturns = returnsToReturnLineItems(returns ?? [])
      const returnableLineItems =
        order.line_items
          ?.filter(
            (lineItem) =>
              lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
          )
          ?.map((lineItem) => {
            const returnLineItemQuantity: number =
              returnLineItemsFromReturns.find(
                (item) =>
                  (item.sku_code != null &&
                    item.sku_code === lineItem.sku_code) ||
                  (item.bundle_code != null &&
                    item.bundle_code === lineItem.bundle_code)
              )?.quantity ?? 0
            return {
              ...lineItem,
              quantity: lineItem.quantity - returnLineItemQuantity
            }
          })
          .filter((lineItem) => lineItem.quantity > 0) ?? []
      return returnableLineItems
    }
    return []
  }, [order.line_items, returns])
}

function returnsToReturnLineItems(returns: Return[]): ReturnLineItem[] {
  const returnLineItems: Record<string, ReturnLineItem> = {}

  for (const returnObj of returns) {
    for (const returnLineItem of returnObj.return_line_items ?? []) {
      if (
        returnObj.status === 'draft' ||
        returnObj.status === 'cancelled' ||
        (returnLineItem.sku_code == null && returnLineItem.bundle_code == null)
      ) {
        break
      }

      const returnLineItemSkuCode = returnLineItem.sku_code ?? ''
      const returnLineItemBundleCode = returnLineItem.bundle_code ?? ''
      const returnLineItemKey =
        returnLineItemSkuCode.length > 0
          ? returnLineItemSkuCode
          : returnLineItemBundleCode

      const currentReturnLineItem = returnLineItems[returnLineItemKey]

      if (currentReturnLineItem != null) {
        currentReturnLineItem.quantity += currentReturnLineItem.quantity
      } else {
        returnLineItems[returnLineItemKey] = {
          ...returnLineItem,
          type: 'return_line_items',
          name: returnLineItem.name,
          sku_code: returnLineItem.sku_code,
          bundle_code: returnLineItem.bundle_code,
          image_url: returnLineItem.image_url,
          quantity: returnLineItem.quantity ?? 0
        }
      }
    }
  }

  return Object.values(returnLineItems)
}
