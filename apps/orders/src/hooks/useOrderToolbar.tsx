import {
  getTriggerAttributeName,
  getTriggerAttributes
} from '#components/OrderSummary/orderDictionary'
import { appRoutes } from '#data/routes'
import { useMarketInventoryModel } from '#hooks/useMarketInventoryModel'
import { useReturnableList } from '#hooks/useReturnableList'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  useTokenProvider,
  type DropdownItemProps
} from '@commercelayer/app-elements'
import type { PageHeadingToolbarProps } from '@commercelayer/app-elements/dist/ui/atoms/PageHeading/PageHeadingToolbar'
import { type Order } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useLocation } from 'wouter'

export function useOrderToolbar({
  order
}: {
  order: Order
}): PageHeadingToolbarProps {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { inventoryModel } = useMarketInventoryModel(order.market?.id)
  const returnableLineItems = useReturnableList(order)
  const orderReturnStockLocation =
    inventoryModel?.inventory_return_locations ?? []
  const showReturnDropDownItem =
    canUser('create', 'returns') &&
    order.fulfillment_status === 'fulfilled' &&
    orderReturnStockLocation.length > 0 &&
    returnableLineItems.length > 0

  const createReturnDropDownItem = useMemo<
    DropdownItemProps | undefined
  >(() => {
    return showReturnDropDownItem
      ? {
          label: 'Request return',
          onClick: () => {
            setLocation(appRoutes.return.makePath({ orderId: order.id }))
          }
        }
      : undefined
  }, [order, returnableLineItems, showReturnDropDownItem])

  const { dispatch } = useTriggerAttribute(order.id)

  const triggerMenuActions = useMemo(() => {
    const triggerAttributes = getTriggerAttributes(order)
    return getTriggerAttributesForUser(canUser).filter((attr) =>
      triggerAttributes.includes(attr)
    )
  }, [order])

  const triggerDropDownItems: DropdownItemProps[] = triggerMenuActions.map(
    (triggerAttribute) => ({
      label: getTriggerAttributeName(triggerAttribute),
      onClick: () => {
        // refund action has its own form page
        if (triggerAttribute === '_refund') {
          setLocation(appRoutes.refund.makePath({ orderId: order.id }))
          return
        }

        void dispatch(triggerAttribute)
      }
    })
  )

  const dropdownItemsGroup: DropdownItemProps[] =
    createReturnDropDownItem != null
      ? [createReturnDropDownItem, ...triggerDropDownItems]
      : [...triggerDropDownItems]

  return {
    buttons:
      dropdownItemsGroup.length === 1 && dropdownItemsGroup[0] != null
        ? [
            {
              label: dropdownItemsGroup[0].label,
              onClick: dropdownItemsGroup[0].onClick,
              size: 'small'
            }
          ]
        : undefined,
    dropdownItems:
      dropdownItemsGroup.length === 1 ? undefined : [dropdownItemsGroup]
  }
}

type UITriggerAttributes = Parameters<typeof getTriggerAttributeName>[0]

type CanUserSignature = ReturnType<typeof useTokenProvider>['canUser']
function getTriggerAttributesForUser(
  canUser: CanUserSignature
): UITriggerAttributes[] {
  const onOrder: UITriggerAttributes[] = canUser('update', 'orders')
    ? ['_archive', '_unarchive']
    : []
  const onCapture: UITriggerAttributes[] = canUser('update', 'transactions')
    ? ['_refund']
    : []
  return [...onOrder, ...onCapture]
}
