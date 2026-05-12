import {
  type DropdownItemProps,
  type PageHeadingToolbarProps,
  useConfirmDialog,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useMemo } from "react"
import { useLocation } from "wouter"
import {
  getTriggerAttributeIcon,
  getTriggerAttributeName,
  getTriggerAttributes,
} from "#components/OrderSummary/orderDictionary"
import { appRoutes } from "#data/routes"
import { useMarketInventoryModel } from "#hooks/useMarketInventoryModel"
import { useReturnableList } from "#hooks/useReturnableList"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"

interface OrderToolbar {
  toolbar: PageHeadingToolbarProps
  confirmDialogs: React.ReactElement[]
}

export function useOrderToolbar({ order }: { order: Order }): OrderToolbar {
  const { canUser } = useTokenProvider()
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
          onClick: () => {
            setLocation(appRoutes.return.makePath({ orderId: order.id }))
          },
        }
      : undefined
  }, [order, returnableLineItems, showReturnDropDownItem])

  const { dispatch } = useTriggerAttribute(order.id)
  const { show: showFulfillConfirm, ConfirmDialog: FulfillConfirmDialogBase } =
    useConfirmDialog()

  const triggerMenuActions = useMemo(() => {
    const triggerAttributes = getTriggerAttributes(order)

    return getTriggerAttributesForUser(canUser).filter((attr) =>
      triggerAttributes.includes(attr),
    )
  }, [order])

  const triggerDropDownItems: DropdownItemProps[] = triggerMenuActions.map(
    (triggerAttribute) => ({
      label: getTriggerAttributeName(triggerAttribute),
      icon: getTriggerAttributeIcon(triggerAttribute),
      onClick: () => {
        // refund action has its own form page
        if (triggerAttribute === "_refund") {
          setLocation(appRoutes.refund.makePath({ orderId: order.id }))
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
): UITriggerAttributes[] {
  const onOrder: UITriggerAttributes[] = canUser("update", "orders")
    ? ["_archive", "_unarchive"]
    : []
  const onCapture: UITriggerAttributes[] = canUser("update", "transactions")
    ? ["_refund"]
    : []
  return [...onOrder, ...onCapture]
}
