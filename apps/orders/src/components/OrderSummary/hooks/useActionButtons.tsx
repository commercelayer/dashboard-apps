import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import { type ActionButtonsProps } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useCaptureOverlay } from '../../../hooks/useCaptureOverlay'
import {
  getTriggerAttributeName,
  getTriggerAttributes
} from '../orderDictionary'
import { useOrderStatus } from './useOrderStatus'
import { useSelectShippingMethodOverlay } from './useSelectShippingMethodOverlay'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useActionButtons = ({ order }: { order: Order }) => {
  const triggerAttributes = getTriggerAttributes(order)

  const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)
  const { hasInvalidShipments, hasLineItems } = useOrderStatus(order)

  const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
    useCaptureOverlay()
  const { show: showCancelOverlay, Overlay: CancelOverlay } = useCancelOverlay()
  const {
    show: showSelectShippingMethodOverlay,
    Overlay: SelectShippingMethodOverlay
  } = useSelectShippingMethodOverlay()

  const diffTotalAndPlacedTotal =
    (order.total_amount_with_taxes_cents ?? 0) -
    (order.place_total_amount_cents ?? 0)

  const isOriginalOrderAmountExceeded =
    order.status === 'editing' && diffTotalAndPlacedTotal > 0

  const standardFooterActions: ActionButtonsProps['actions'] = useMemo(() => {
    return triggerAttributes
      .filter(
        (
          triggerAttribute
        ): triggerAttribute is Exclude<
          typeof triggerAttribute,
          '_archive' | '_unarchive' | '_refund'
        > => !['_archive', '_unarchive', '_refund'].includes(triggerAttribute)
      )
      .map((triggerAttribute) => {
        return {
          label: getTriggerAttributeName(triggerAttribute),
          variant: triggerAttribute === '_cancel' ? 'secondary' : 'primary',
          disabled: isLoading,
          onClick: () => {
            if (triggerAttribute === '_capture') {
              showCaptureOverlay()
              return
            }
            if (triggerAttribute === '_cancel') {
              showCancelOverlay()
              return
            }

            void dispatch(triggerAttribute)
          }
        }
      })
  }, [
    dispatch,
    isLoading,
    showCancelOverlay,
    showCaptureOverlay,
    triggerAttributes
  ])

  const editingFooterActions: ActionButtonsProps['actions'] = useMemo(() => {
    if (order.status !== 'editing') {
      return []
    }

    const cancelAction: ActionButtonsProps['actions'][number] = {
      label: getTriggerAttributeName('_cancel'),
      variant: 'secondary',
      disabled: isLoading,
      onClick: () => {
        showCancelOverlay()
      }
    }

    const continueAction: ActionButtonsProps['actions'][number] = {
      label: 'Continue editing',
      disabled: isLoading || !hasLineItems,
      onClick: () => {
        showSelectShippingMethodOverlay()
      }
    }

    const finishAction: ActionButtonsProps['actions'][number] = {
      label: 'Finish',
      disabled: isLoading || isOriginalOrderAmountExceeded || !hasLineItems,
      onClick: () => {
        void dispatch('_stop_editing')
      }
    }

    return [cancelAction, hasInvalidShipments ? continueAction : finishAction]
  }, [
    isLoading,
    hasLineItems,
    order,
    showCancelOverlay,
    showSelectShippingMethodOverlay,
    dispatch
  ])

  return {
    actions: [...standardFooterActions, ...editingFooterActions],
    hasInvalidShipments,
    CaptureOverlay,
    CancelOverlay,
    SelectShippingMethodOverlay,
    errors,
    dispatch
  }
}
