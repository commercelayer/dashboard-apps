import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useAdjustTotalOverlay } from './hooks/useAdjustTotalOverlay'
import { useOrderStatus } from './hooks/useOrderStatus'
import { useSelectShippingMethodOverlay } from './hooks/useSelectShippingMethodOverlay'
import {
  getManualAdjustment,
  renderAdjustments,
  renderDiscounts,
  renderTotalRow,
  renderTotalRowAmount
} from './utils'

export const SummaryRows: React.FC<{ order: Order; editable: boolean }> = ({
  order,
  editable = false
}) => {
  const { canUser } = useTokenProvider()
  const { mutateOrder } = useOrderDetails(order.id)
  const { hasInvalidShipments, hasShippableLineItems } = useOrderStatus(order)

  const { Overlay: AdjustTotalOverlay, open: openAdjustTotalOverlay } =
    useAdjustTotalOverlay(order, () => {
      void mutateOrder()
    })

  const {
    show: showSelectShippingMethodOverlay,
    Overlay: SelectShippingMethodOverlay
  } = useSelectShippingMethodOverlay()

  const canEditManualAdjustment =
    editable &&
    canUser('update', 'adjustments') &&
    canUser('destroy', 'adjustments')

  const canEditShipments = editable && canUser('update', 'shipments')

  const manualAdjustment = getManualAdjustment(order)

  const adjustmentButton = useMemo(() => {
    const adjustmentHasValue =
      manualAdjustment != null && manualAdjustment.total_amount_cents !== 0
    return renderTotalRow({
      label: 'Adjustment',
      value: (
        <>
          <AdjustTotalOverlay />
          <Button
            variant='link'
            onClick={() => {
              openAdjustTotalOverlay()
            }}
          >
            {adjustmentHasValue
              ? manualAdjustment.formatted_total_amount
              : 'Adjust total'}
          </Button>
        </>
      )
    })
  }, [manualAdjustment, AdjustTotalOverlay, openAdjustTotalOverlay])

  const adjustmentText = useMemo(() => {
    if (manualAdjustment == null) {
      return null
    }

    return renderTotalRowAmount({
      label: 'Adjustment',
      amountCents: manualAdjustment.total_amount_cents,
      formattedAmount: manualAdjustment.formatted_total_amount
    })
  }, [manualAdjustment])

  const shippingMethodRow = useMemo(() => {
    if (!hasShippableLineItems) {
      return
    }

    const shippingMethodText =
      order.shipping_amount_cents !== 0 ? (
        order.formatted_shipping_amount
      ) : hasInvalidShipments ? (
        <Text variant='info'>To be calculated</Text>
      ) : (
        'free'
      )

    return renderTotalRow({
      label:
        order.shipments?.length === 1
          ? (order.shipments[0]?.shipping_method?.name ?? 'Shipping')
          : 'Shipping',
      value:
        canEditShipments && !hasInvalidShipments ? (
          <>
            <SelectShippingMethodOverlay order={order} />
            <Button
              variant='link'
              onClick={() => {
                showSelectShippingMethodOverlay()
              }}
            >
              {shippingMethodText}
            </Button>
          </>
        ) : (
          shippingMethodText
        )
    })
  }, [
    order,
    hasInvalidShipments,
    canEditShipments,
    SelectShippingMethodOverlay,
    showSelectShippingMethodOverlay
  ])

  return (
    <Spacer top='4' bottom='4'>
      {renderTotalRowAmount({
        force: true,
        label: 'Subtotal',
        amountCents: order.subtotal_amount_cents,
        formattedAmount: order.formatted_subtotal_amount
      })}
      {shippingMethodRow}
      {renderTotalRowAmount({
        label: order.payment_method?.name ?? 'Payment method',
        amountCents: order.payment_method_amount_cents,
        formattedAmount: order.formatted_payment_method_amount
      })}
      {renderTotalRowAmount({
        label: 'Taxes',
        amountCents: order.total_tax_amount_cents,
        formattedAmount: order.formatted_total_tax_amount
      })}
      {renderDiscounts(order)}
      {renderAdjustments(order)}
      {canEditManualAdjustment ? adjustmentButton : adjustmentText}
      {renderTotalRowAmount({
        label: 'Gift card',
        amountCents: order.gift_card_amount_cents,
        formattedAmount: order.formatted_gift_card_amount
      })}
      {renderTotalRowAmount({
        force: true,
        label: 'Total',
        amountCents: order.total_amount_with_taxes_cents,
        formattedAmount: order.formatted_total_amount_with_taxes,
        bold: true
      })}
    </Spacer>
  )
}
