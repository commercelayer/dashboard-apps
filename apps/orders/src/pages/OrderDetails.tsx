import {
  Button,
  EmptyState,
  formatDateWithPredicate,
  PageLayout,
  ResourceAttachments,
  SkeletonTemplate,
  Spacer,
  type ToolbarItem,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useLocation, useRoute } from "wouter"
import { OrderAddresses } from "#components/OrderAddresses"
import { OrderCustomer } from "#components/OrderCustomer"
import { OrderPayment } from "#components/OrderPayment"
import { OrderReturns } from "#components/OrderReturns"
import { OrderShipments } from "#components/OrderShipments"
import { OrderSteps } from "#components/OrderSteps"
import { OrderSummary } from "#components/OrderSummary"
import { useOrderStatus } from "#components/OrderSummary/hooks/useOrderStatus"
import { Timeline } from "#components/Timeline"
import { appRoutes } from "#data/routes"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useOrderReturns } from "#hooks/useOrderReturns"
import { useOrderToolbar } from "#hooks/useOrderToolbar"
import { getOrderTitle } from "#utils/getOrderTitle"

function OrderDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
    user,
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const orderId = params?.orderId ?? ""

  const {
    order,
    isLoading: isLoadingOrder,
    error,
    mutateOrder,
  } = useOrderDetails(orderId)
  const { isPendingWithTransactions } = useOrderStatus(order)
  const { returns, isLoadingReturns } = useOrderReturns(orderId)
  const { toolbar, confirmDialogs } = useOrderToolbar({ order })

  const { goBack } = useAppLinking()

  if (canUser("update", "orders")) {
    if (
      order.status === "pending" &&
      !isPendingWithTransactions &&
      extras?.salesChannels != null &&
      extras?.salesChannels.length > 0 &&
      order.market?.private === false
    ) {
      const checkoutLinkButton: ToolbarItem = {
        label: "Checkout",
        icon: "lightning",
        size: "small",
        variant: "secondary",
        onClick: () => {
          setLocation(appRoutes.linkDetails.makePath({ orderId }))
        },
      }

      if (toolbar.buttons != null) {
        toolbar.buttons.push(checkoutLinkButton)
      } else {
        toolbar.buttons = [checkoutLinkButton]
      }
    }
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "orders",
      orderId,
      extras,
    )
    if (toolbar.buttons != null) {
      toolbar.buttons?.push(resourceInspectorButton)
    } else {
      toolbar.buttons = [resourceInspectorButton]
    }
  }

  if (orderId === undefined || !canUser("read", "orders") || error != null) {
    return (
      <PageLayout
        fullWidth
        title={t("resources.orders.name_other")}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        mode={mode}
        scrollToTop
      >
        <EmptyState
          title={t("common.not_authorized")}
          action={
            <Button
              variant="primary"
              onClick={() => {
                setLocation(appRoutes.home.makePath({}))
              }}
            >
              {t("common.go_back")}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const isLoading = isLoadingOrder
  const pageTitle = getOrderTitle(order)

  return (
    <PageLayout
      fullWidth
      mode={mode}
      toolbar={toolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle} <OrderSteps order={order} />
        </SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div className="flex gap-1">
            {order.placed_at != null ? (
              <div>
                {formatDateWithPredicate({
                  predicate: t("resources.orders.attributes.status.placed"),
                  isoDate: order.placed_at ?? "",
                  timezone: user?.timezone,
                  locale: user?.locale,
                })}
              </div>
            ) : order.updated_at != null ? (
              <div>
                {formatDateWithPredicate({
                  predicate: t("common.updated"),
                  isoDate: order.updated_at ?? "",
                  timezone: user?.timezone,
                  locale: user?.locale,
                })}
              </div>
            ) : null}{" "}
            <div>in {order.market?.name} market</div>
          </div>
          {order.reference != null && <div>Ref. {order.reference}</div>}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            defaultRelativePath: appRoutes.home.makePath({}),
            currentResourceId: orderId,
          })
        },
        label: "",
        icon: "arrowLeft",
        variant: "button",
      }}
      gap="only-top"
      scrollToTop
      // supporting information sits beside the order itself, see detail.png
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <OrderCustomer order={order} />
          <div className="mt-14 lg:mt-10">
            <OrderAddresses order={order} />
          </div>
          <div className="mt-14 lg:mt-10">
            {/* `print:hidden` as it was in the main column: a printed order is a
                document for the customer, and the id/reference/timestamps are for
                whoever works on it */}
            <ResourceInfoBlocks
              className="print:hidden"
              resource={order}
              title={pageTitle}
              onUpdated={async () => {
                void mutateOrder()
              }}
              onTagClick={(tagId) => {
                setLocation(appRoutes.home.makePath({}, `tags_id_in=${tagId}`))
              }}
            />
          </div>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
    >
      <SkeletonTemplate isLoading={isLoading}>
        <OrderSummary order={order} />
        <div className="print:hidden">
          <Spacer top="14">
            <OrderPayment order={order} />
          </Spacer>
        </div>
        <div className="print:hidden">
          <Spacer top="14">
            <OrderShipments order={order} />
          </Spacer>
          {!isLoadingReturns && (
            <Spacer top="14">
              <OrderReturns returns={returns} />
            </Spacer>
          )}
        </div>
        <div className="print:hidden">
          <Spacer top="14">
            <ResourceAttachments resourceType="orders" resourceId={order.id} />
          </Spacer>
        </div>
        {!["draft"].includes(order.status) && (
          <div className="print:hidden">
            <Spacer top="14">
              <Timeline order={order} />
            </Spacer>
          </div>
        )}
      </SkeletonTemplate>

      {confirmDialogs}
    </PageLayout>
  )
}

export default OrderDetails
