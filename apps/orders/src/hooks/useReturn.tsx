import { isMockedId } from '#mocks'
import { useCoreApi, useCoreSdkProvider } from '@commercelayer/app-elements'
import type { Order, Return } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'
import { useOrderReturns } from './useOrderReturns'

/**
 * This hook is used to obtain a `Return` resource suitable for return creation procedure.
 * It must be a `Return` with `draft` status and no related `return_line_items`.
 * Returned resource could be an existing `Return` or a brand new if any in status `draft` is available.
 * @param order - the order attached to the `Return` object
 * @returns - a valid `Return` object
 */
export function useReturn(order: Order): Return | undefined {
  const [returnObj, setReturnObj] = useState<Return>()
  const [returnNeedsCreation, setReturnNeedsCreation] = useState(false)

  const { sdkClient } = useCoreSdkProvider()
  const { data: createdReturnObj } = useCoreApi(
    'returns',
    'create',
    returnNeedsCreation && !isMockedId(order.id)
      ? [
          {
            order: sdkClient.orders.relationship(order.id)
          },
          {
            include: [
              'origin_address',
              'stock_location',
              'stock_location.address'
            ]
          }
        ]
      : null
  )

  const { returns } = useOrderReturns(order.id)

  useEffect(() => {
    if (returns != null) {
      const draftReturnObject = returns?.filter(
        (returnObj) =>
          returnObj.status === 'draft' &&
          (returnObj.return_line_items ?? []).length === 0
      )[0]
      if (draftReturnObject != null) {
        setReturnObj(draftReturnObject)
      } else {
        setReturnNeedsCreation(true)
      }
    }
  }, [returns])

  useEffect(() => {
    if (createdReturnObj != null) {
      setReturnObj(createdReturnObj)
    }
  }, [createdReturnObj])

  return returnObj
}
