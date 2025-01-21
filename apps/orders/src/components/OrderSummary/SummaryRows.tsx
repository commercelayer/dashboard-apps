import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Text,
  useTokenProvider,
  useTranslation
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
  const { t } = useTranslation()
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
      label: t('resources.adjustments.name_other'),
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
              : t('apps.orders.actions.adjust_total')}
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
      label: t('resources.adjustments.name'),
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
        <Text variant='info'>{t('apps.orders.details.to_be_calculated')}</Text>
      ) : (
        'free'
      )

    return renderTotalRow({
      label:
        order.shipments?.length === 1
          ? (order.shipments[0]?.shipping_method?.name ??
            t('apps.orders.details.shipping'))
          : t('apps.orders.details.shipping'),
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
    <>
      {renderTotalRowAmount({
        force: true,
        label: t('apps.orders.details.subtotal'),
        amountCents: order.subtotal_amount_cents,
        formattedAmount: order.formatted_subtotal_amount
      })}
      {shippingMethodRow}
      {renderTotalRowAmount({
        label:
          order.payment_method?.name ?? t('apps.orders.details.payment_method'),
        amountCents: order.payment_method_amount_cents,
        formattedAmount: order.formatted_payment_method_amount
      })}
      {renderTotalRowAmount({
        label: (
          <>
            {t('apps.orders.details.taxes')}
            {order.tax_included === true ? (
              <Text variant='info'> ({t('apps.orders.details.included')})</Text>
            ) : null}
          </>
        ),
        amountCents: order.total_tax_amount_cents,
        formattedAmount: order.formatted_total_tax_amount
      })}
      {renderDiscounts(order)}
      {renderAdjustments(order)}
      {canEditManualAdjustment ? adjustmentButton : adjustmentText}
      {renderTotalRowAmount({
        label: t('resources.gift_cards.name'),
        amountCents: order.gift_card_amount_cents,
        formattedAmount: order.formatted_gift_card_amount
      })}
      {renderTotalRowAmount({
        force: true,
        label: t('apps.orders.details.total'),
        amountCents: order.total_amount_with_taxes_cents,
        formattedAmount: order.formatted_total_amount_with_taxes,
        bold: true
      })}
    </>
  )
}
