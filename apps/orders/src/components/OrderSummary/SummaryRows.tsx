import {
  A,
  Button,
  maskGiftCardCode,
  Text,
  useAppLinking,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { GiftCard, Order } from "@commercelayer/sdk"
import { useEffect, useMemo, useState } from "react"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useAdjustTotalOverlay } from "./hooks/useAdjustTotalOverlay"
import { useOrderStatus } from "./hooks/useOrderStatus"
import { useSelectShippingMethodOverlay } from "./hooks/useSelectShippingMethodOverlay"
import {
  getManualAdjustment,
  renderAdjustments,
  renderDiscounts,
  renderTotalRow,
  renderTotalRowAmount,
} from "./utils"

export const SummaryRows: React.FC<{ order: Order; editable: boolean }> = ({
  order,
  editable = false,
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
    Overlay: SelectShippingMethodOverlay,
  } = useSelectShippingMethodOverlay()

  const canEditManualAdjustment =
    editable &&
    canUser("update", "adjustments") &&
    canUser("destroy", "adjustments")

  const canEditShipments = editable && canUser("update", "shipments")

  const manualAdjustment = getManualAdjustment(order)

  const adjustmentButton = useMemo(() => {
    const adjustmentHasValue =
      manualAdjustment != null && manualAdjustment.total_amount_cents !== 0
    return renderTotalRow({
      label: t("resources.adjustments.name_other"),
      value: (
        <>
          <AdjustTotalOverlay />
          <Button
            variant="link"
            onClick={() => {
              openAdjustTotalOverlay()
            }}
          >
            {adjustmentHasValue
              ? manualAdjustment.formatted_total_amount
              : t("apps.orders.actions.adjust_total")}
          </Button>
        </>
      ),
    })
  }, [manualAdjustment, AdjustTotalOverlay, openAdjustTotalOverlay])

  const adjustmentText = useMemo(() => {
    if (manualAdjustment == null) {
      return null
    }

    return renderTotalRowAmount({
      label: t("resources.adjustments.name"),
      amountCents: manualAdjustment.total_amount_cents,
      formattedAmount: manualAdjustment.formatted_total_amount,
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
        <Text variant="info">{t("apps.orders.details.to_be_calculated")}</Text>
      ) : (
        "free"
      )

    return renderTotalRow({
      label:
        order.shipments?.length === 1
          ? (order.shipments[0]?.shipping_method?.name ??
            t("apps.orders.details.shipping"))
          : t("apps.orders.details.shipping"),
      value:
        canEditShipments && !hasInvalidShipments ? (
          <>
            <SelectShippingMethodOverlay order={order} />
            <Button
              variant="link"
              onClick={() => {
                showSelectShippingMethodOverlay()
              }}
            >
              {shippingMethodText}
            </Button>
          </>
        ) : (
          shippingMethodText
        ),
    })
  }, [
    order,
    hasInvalidShipments,
    canEditShipments,
    SelectShippingMethodOverlay,
    showSelectShippingMethodOverlay,
  ])

  return (
    <>
      {renderTotalRowAmount({
        force: true,
        label: t("apps.orders.details.subtotal"),
        amountCents: order.subtotal_amount_cents,
        formattedAmount: order.formatted_subtotal_amount,
      })}
      {shippingMethodRow}
      {renderTotalRowAmount({
        label:
          order.payment_method?.name ?? t("apps.orders.details.payment_method"),
        amountCents: order.payment_method_amount_cents,
        formattedAmount: order.formatted_payment_method_amount,
      })}
      {renderTotalRowAmount({
        label: (
          <>
            {t("apps.orders.details.taxes")}
            {order.tax_included === true ? (
              <Text variant="info"> ({t("apps.orders.details.included")})</Text>
            ) : null}
          </>
        ),
        amountCents: order.total_tax_amount_cents,
        formattedAmount: order.formatted_total_tax_amount,
      })}
      {renderDiscounts(order)}
      {renderAdjustments(order)}
      {canEditManualAdjustment ? adjustmentButton : adjustmentText}
      {renderTotalRowAmount({
        label: <OrderGiftCardLabel giftCardCode={order.gift_card_code} />,
        amountCents: order.gift_card_amount_cents,
        formattedAmount: order.formatted_gift_card_amount,
      })}
      {renderTotalRowAmount({
        force: true,
        label: t("apps.orders.details.total"),
        amountCents: order.total_amount_with_taxes_cents,
        formattedAmount: order.formatted_total_amount_with_taxes,
        bold: true,
      })}
    </>
  )
}

/**
 * This component is responsible for rendering a valid given gift card code,
 * sliced by a defined amount of characters, eventually linked to the gift
 * card detail page of the `gift_cards` app.
 */
const OrderGiftCardLabel: React.FC<{
  giftCardCode?: Order["gift_card_code"]
}> = ({ giftCardCode }) => {
  const { t } = useTranslation()
  const { sdkClient } = useCoreSdkProvider()
  const { navigateTo } = useAppLinking()
  const [orderGiftCard, setOrderGiftCard] = useState<GiftCard>()

  useEffect(() => {
    if (giftCardCode != null) {
      void sdkClient.gift_cards
        .list({
          pageSize: 1,
          fields: {
            gift_cards: ["id"],
          },
          filters: {
            code_eq: giftCardCode,
          },
        })
        .then((data) => {
          if (data[0] != null) {
            setOrderGiftCard(data[0])
          }
        })
    }
  }, [giftCardCode])

  const giftCardLabel = useMemo(() => {
    const giftCardLabel = (
      <Text weight="bold">{maskGiftCardCode(giftCardCode)}</Text>
    )

    const giftCardHref = navigateTo({
      app: "gift_cards",
      resourceId: orderGiftCard?.id,
    })?.href
    const giftCardLink =
      giftCardHref != null ? (
        <A href={giftCardHref}>{giftCardLabel}</A>
      ) : (
        giftCardLabel
      )

    return giftCardLink
  }, [giftCardCode, orderGiftCard])

  if (giftCardCode == null) {
    return null
  }

  return (
    <>
      <Text>{t("resources.gift_cards.name")} ending in </Text>
      {giftCardLabel}
    </>
  )
}
