import {
  type DropdownItemProps,
  type PageHeadingToolbarProps,
  useConfirmDialog,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { Fragment, useMemo } from "react"
import { useLocation } from "wouter"
import { usePaymentSessionRefundModal } from "#components/OrderPayment/hooks/usePaymentSessionRefundModal"
import {
  getOrderRefundableCaptures,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import {
  getTriggerAttributeIcon,
  getTriggerAttributeName,
  getTriggerAttributes,
} from "#components/OrderSummary/orderDictionary"
import { appRoutes } from "#data/routes"
import { useMarketInventoryModel } from "#hooks/useMarketInventoryModel"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useReturnableList } from "#hooks/useReturnableList"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"

interface OrderToolbar {
  toolbar: PageHeadingToolbarProps
  confirmDialogs: React.ReactElement[]
}

export function useOrderToolbar({ order }: { order: Order }): OrderToolbar {
  const { canUser } = useTokenProvider()
  const { mutateOrder } = useOrderDetails(order.id)
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const { inventoryModel } = useMarketInventoryModel(order.market?.id)
  const returnableLineItems = useReturnableList(order)
  const orderReturnStockLocation =
    inventoryModel?.inventory_return_locations ?? []
  const showReturnDropDownItem =
    canUser("create", "returns") &&
    orderReturnStockLocation.length > 0 &&
    returnableLineItems.length > 0

  const createReturnDropDownItem = useMemo<
    DropdownItemProps | undefined
  >(() => {
    return showReturnDropDownItem
      ? {
          label: t("apps.orders.tasks.request_return"),
          icon: "arrowUUpLeft",
          onClick: () => {
            setLocation(appRoutes.return.makePath({ orderId: order.id }))
          },
        }
      : undefined
  }, [order, returnableLineItems, showReturnDropDownItem])

  /**
   * Order-level refund on the 2026-05 model: every refundable capture across
   * the order's sessions, in the same modal the rows use. Preselected only
   * when there is one, so a single-session order needs no pointless click.
   * Legacy orders keep their own refund page, untouched.
   */
  const orderRefundTargets = getOrderRefundableCaptures(order)
  const { modal: refundModal, open: openRefund } = usePaymentSessionRefundModal(
    {
      targets: orderRefundTargets,
      onChange: () => {
        void mutateOrder()
      },
    },
  )

  const { dispatch } = useTriggerAttribute(order.id)
  const { show: showFulfillConfirm, ConfirmDialog: FulfillConfirmDialogBase } =
    useConfirmDialog()

  // On the new model the modal refunds a capture, so an order whose captures
  // are all fully refunded has nothing to offer and the entry is dropped.
  // Legacy orders keep their own page, which handles that case itself.
  const hasNothingToRefund =
    isNewPaymentModel(order) && orderRefundTargets.length === 0

  const triggerMenuActions = useMemo(() => {
    const triggerAttributes = getTriggerAttributes(order)

    return getTriggerAttributesForUser(canUser, isNewPaymentModel(order))
      .filter((attr) => triggerAttributes.includes(attr))
      .filter((attr) => !(attr === "_refund" && hasNothingToRefund))
  }, [order, hasNothingToRefund])

  const triggerDropDownItems: DropdownItemProps[] = triggerMenuActions.map(
    (triggerAttribute) => ({
      label: getTriggerAttributeName(triggerAttribute),
      icon: getTriggerAttributeIcon(triggerAttribute),
      onClick: () => {
        if (triggerAttribute === "_refund") {
          if (isNewPaymentModel(order)) {
            openRefund()
          } else {
            // Legacy refund keeps its own form page.
            setLocation(appRoutes.refund.makePath({ orderId: order.id }))
          }
          return
        }

        void dispatch(triggerAttribute)
      },
    }),
  )

  const fulfillDropdownitem: DropdownItemProps[] =
    order.status === "approved" &&
    order.fulfillment_status === "in_progress" &&
    canUser("update", "orders")
      ? [
          {
            label: getTriggerAttributeName("_fulfill"),
            icon: getTriggerAttributeIcon("_fulfill"),
            onClick: () => {
              showFulfillConfirm()
            },
          },
        ]
      : []

  const dropdownItemsGroup: DropdownItemProps[] =
    createReturnDropDownItem != null
      ? [
          createReturnDropDownItem,
          ...triggerDropDownItems,
          ...fulfillDropdownitem,
        ]
      : [...triggerDropDownItems, ...fulfillDropdownitem]

  return {
    toolbar: {
      dropdownItems: [dropdownItemsGroup],
    },
    confirmDialogs: [
      <Fragment key="order-refund">{refundModal}</Fragment>,
      <FulfillConfirmDialogBase
        key="fulfill"
        icon="packageIcon"
        title="Mark orders as fulfilled?"
        description="This will update the fulfillment status and mark all shipments as shipped."
        successMessage="Order fulfillled"
        confirm={{
          label: "Mark as fulfilled",
          onClick: async () => {
            await dispatch("_fulfill")
          },
        }}
      />,
    ],
  }
}

type UITriggerAttributes = Parameters<typeof getTriggerAttributeName>[0]

type CanUserSignature = ReturnType<typeof useTokenProvider>["canUser"]
function getTriggerAttributesForUser(
  canUser: CanUserSignature,
  isNewPayments: boolean,
): UITriggerAttributes[] {
  const onOrder: UITriggerAttributes[] = canUser("update", "orders")
    ? ["_archive", "_unarchive"]
    : []
  // Legacy refunds are a transaction update, new-model ones create a
  // `payment_refund`, so the permission to check differs per model.
  const canRefund = isNewPayments
    ? canUser("create", "payment_refunds")
    : canUser("update", "transactions")
  const onCapture: UITriggerAttributes[] = canRefund ? ["_refund"] : []
  return [...onOrder, ...onCapture]
}
