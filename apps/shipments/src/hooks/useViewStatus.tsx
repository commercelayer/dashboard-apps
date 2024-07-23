import { hasBeenPurchased } from '@commercelayer/app-elements'
import type { ActionButtonsProps } from '@commercelayer/app-elements/dist/ui/composite/ActionButtons'
import type { Shipment, ShipmentUpdate } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useActiveStockTransfers } from './useActiveStockTransfers'
import { usePickingList } from './usePickingList'

type TriggerAttribute =
  | Extract<keyof ShipmentUpdate, `_${string}`>
  | '_create_parcel'

export type Action = Omit<ActionButtonsProps['actions'][number], 'onClick'> & {
  triggerAttribute: TriggerAttribute
}

interface ViewStatus {
  title: 'Picking list' | 'Packing' | 'Parcels'
  progress?: boolean
  headerAction?: Action
  footerActions?: Action[]
  contextActions?: Action[]
}

export function useViewStatus(shipment: Shipment): ViewStatus {
  const pickingList = usePickingList(shipment)
  const activeStockTransfers = useActiveStockTransfers(shipment)
  const hasPickingItems = pickingList.length > 0
  const hasParcels = shipment.parcels != null && shipment.parcels.length > 0
  const hasCarrierAccounts =
    shipment.carrier_accounts != null && shipment.carrier_accounts.length > 0

  return useMemo(() => {
    const purchased = hasBeenPurchased(shipment)
    const result: ViewStatus = {
      title: !hasPickingItems
        ? 'Parcels'
        : shipment.status === 'packing'
          ? 'Packing'
          : 'Picking list',
      progress: shipment.status === 'packing' && hasPickingItems
    }

    switch (shipment.status) {
      case 'picking':
        result.footerActions = [
          {
            label: 'Put on hold',
            variant: 'secondary',
            triggerAttribute: '_on_hold'
          },
          { label: 'Start packing', triggerAttribute: '_create_parcel' }
        ]
        break

      case 'packing':
        if (hasPickingItems) {
          result.headerAction = {
            label: hasParcels ? 'Continue' : 'Start packing',
            triggerAttribute: '_create_parcel'
          }
          result.contextActions = [
            { label: 'Back to picking', triggerAttribute: '_picking' }
          ]
        } else {
          if (!purchased) {
            if (hasCarrierAccounts) {
              result.contextActions = [
                { label: 'Ready to ship', triggerAttribute: '_ready_to_ship' }
              ]
              result.footerActions = [
                {
                  label: 'Purchase labels',
                  triggerAttribute: '_get_rates'
                }
              ]
            } else {
              result.footerActions = [
                {
                  label: 'Ready to ship',
                  triggerAttribute: '_ready_to_ship'
                }
              ]
            }
          } else {
            result.footerActions = [
              {
                label: 'Ready to ship',
                triggerAttribute: '_ready_to_ship'
              }
            ]
          }
        }
        break

      case 'ready_to_ship':
        result.contextActions = purchased
          ? []
          : [
              {
                label: 'Back to packing',
                triggerAttribute: '_packing'
              }
            ]
        result.footerActions = purchased
          ? []
          : [
              {
                label: 'Mark as shipped',
                triggerAttribute: '_ship'
              }
            ]
        break

      case 'shipped':
        result.contextActions = []
        result.footerActions = [
          {
            label: 'Mark as delivered',
            triggerAttribute: '_deliver'
          }
        ]
        break

      case 'on_hold':
        result.footerActions =
          activeStockTransfers.length === 0
            ? [{ label: 'Start picking', triggerAttribute: '_picking' }]
            : []
        break

      default:
        // Handle unknown status
        break
    }

    return result
  }, [shipment, hasPickingItems, hasParcels, hasBeenPurchased])
}
