import {
  type DropdownItemProps,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useState } from "react"
import { useLocation } from "wouter"
import { appRoutes } from "#data/routes"
import { canDuplicateOrder, waitForOrderCopy } from "#utils/orderCopy"

interface DuplicateOrder {
  /** The toolbar's "Duplicate order", when the user may copy this order. */
  dropdownItem?: DropdownItemProps
  confirmDialog: React.ReactElement
}

/**
 * Duplicates an order through an order copy, which Core runs in the
 * background. The dialog stays open, its buttons disabled, until the copy ends:
 * then the new order opens in the editor, to be reviewed and placed, or the
 * copy's errors are shown and no order is opened.
 */
export function useDuplicateOrder(order: Order): DuplicateOrder {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const { show, ConfirmDialog } = useConfirmDialog()
  const [isCopying, setIsCopying] = useState(false)

  const duplicate = async (): Promise<void> => {
    setIsCopying(true)
    try {
      const orderCopy = await sdkClient.order_copies.create({
        source_order: { id: order.id, type: "orders" },
        // the seller reviews the new order before placing it, so promotions
        // are worked out again, and a coupon no longer valid is dropped rather
        // than failing the copy
        apply_promotions: true,
        ignore_invalid_coupon: true,
      })

      const targetOrder = await waitForOrderCopy(orderCopy, {
        retrieve: async (id) =>
          await sdkClient.order_copies.retrieve(id, {
            include: ["target_order"],
          }),
        messages: {
          aborted: t("apps.orders.duplicate.error_aborted"),
          failed: t("apps.orders.duplicate.error_failed"),
          timeout: t("apps.orders.duplicate.error_timeout"),
        },
      })

      setLocation(appRoutes.new.makePath({ orderId: targetOrder.id }))
    } finally {
      setIsCopying(false)
    }
  }

  return {
    dropdownItem: getDuplicateDropdownItem({
      isVisible: canDuplicateOrder(order) && canUser("create", "order_copies"),
      label: t("apps.orders.duplicate.action"),
      onClick: show,
    }),
    confirmDialog: (
      <ConfirmDialog
        key="duplicate"
        icon="copy"
        title={t("apps.orders.duplicate.title")}
        description={
          // a status region from the start, so the copy's progress, which
          // fills it, is announced
          <span role="status">{getDuplicateDescription(isCopying, t)}</span>
        }
        confirm={{
          label: t("apps.orders.duplicate.confirm"),
          onClick: duplicate,
        }}
        cancelLabel={t("common.cancel")}
      />
    ),
  }
}

function getDuplicateDropdownItem({
  isVisible,
  label,
  onClick,
}: {
  isVisible: boolean
  label: string
  onClick: () => void
}): DropdownItemProps | undefined {
  if (!isVisible) {
    return undefined
  }

  return { label, icon: "copy", onClick }
}

function getDuplicateDescription(
  isCopying: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (isCopying) {
    return t("apps.orders.duplicate.copying")
  }

  return t("apps.orders.duplicate.description")
}
