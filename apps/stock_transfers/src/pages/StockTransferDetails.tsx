import {
  Badge,
  type BadgeProps,
  Button,
  type DropdownItemProps,
  EmptyState,
  formatDateWithPredicate,
  getStockTransferDisplayStatus,
  type PageHeadingProps,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useConfirmDialog,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useMemo } from "react"
import { Link, useLocation, useRoute } from "wouter"
import { StockTransferAddresses } from "#components/StockTransferAddresses"
import { StockTransferInfo } from "#components/StockTransferInfo"
import { StockTransferSummary } from "#components/StockTransferSummary"
import { Timeline } from "#components/Timeline"
import {
  getStockTransferTriggerActions,
  getStockTransferTriggerAttributeName,
} from "#data/dictionaries"
import { appRoutes } from "#data/routes"
import { useStockTransferDetails } from "#hooks/useStockTransferDetails"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"

export function StockTransferDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
    user,
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ stockTransferId: string }>(
    appRoutes.details.path,
  )
  const { goBack } = useAppLinking()

  const stockTransferId = params?.stockTransferId ?? ""

  const { stockTransfer, isLoading, mutateStockTransfer, error } =
    useStockTransferDetails(stockTransferId)

  const triggerMenuActions = useMemo(() => {
    return getStockTransferTriggerActions(stockTransfer)
  }, [stockTransfer])

  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()
  const { dispatch } = useTriggerAttribute(stockTransfer.id)

  if (
    stockTransferId === "" ||
    !canUser("read", "stock_transfers") ||
    error != null
  ) {
    return (
      <PageLayout
        title="Stock transfers"
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        mode={mode}
      >
        <EmptyState
          title="Not authorized"
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant="primary">Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const triggerDropDownItems: DropdownItemProps[][] = triggerMenuActions
    .toReversed()
    .reduce<DropdownItemProps[][]>((acc, triggerAction, idx) => {
      const dropdownItem = {
        label: getStockTransferTriggerAttributeName(
          triggerAction.triggerAttribute,
        ),
        onClick: () => {
          // cancel action has its own modal
          if (triggerAction.triggerAttribute === "_cancel") {
            showCancelDialog()
            return
          }
          void dispatch(triggerAction.triggerAttribute)
        },
      }

      const isLast = idx === triggerMenuActions.length - 1

      if (isLast) {
        acc.push([dropdownItem])
      } else {
        const [firstGroup] = acc
        if (firstGroup != null) {
          firstGroup.push(dropdownItem)
        } else {
          acc.push([dropdownItem])
        }
      }

      return acc
    }, [])

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: triggerDropDownItems,
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "stock_transfers",
      stockTransfer.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  const pageTitle = `Stock transfer #${stockTransfer.number}`

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}{" "}
          <Badge
            variant={toBadgeVariant(
              getStockTransferDisplayStatus(stockTransfer).color,
            )}
          >
            {getStockTransferDisplayStatus(stockTransfer).label}
          </Badge>
        </SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {stockTransfer.updated_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: "Updated",
                isoDate: stockTransfer.updated_at,
                timezone: user?.timezone,
              })}
            </div>
          ) : stockTransfer.created_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: "Created",
                isoDate: stockTransfer.created_at,
                timezone: user?.timezone,
              })}
            </div>
          ) : null}
          {stockTransfer.reference != null && (
            <div>Ref. {stockTransfer.reference}</div>
          )}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: stockTransfer.id,
            defaultRelativePath: appRoutes.home.makePath({}),
          })
        },
        label: "",
        icon: "arrowLeft",
        variant: "button",
      }}
      scrollToTop
      // no bottom gap under the heading: the main column opens with a
      // `Spacer top="14"`, which is what the sidebar column lines up with
      gap="only-top"
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <StockTransferAddresses stockTransfer={stockTransfer} />
          <div className="mt-14 lg:mt-10 print:hidden">
            <ResourceInfoBlocks
              resource={stockTransfer}
              title={pageTitle}
              onUpdated={async () => {
                void mutateStockTransfer()
              }}
            />
          </div>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
    >
      <SkeletonTemplate isLoading={isLoading}>
        <ConfirmDialog
          icon="x"
          title={`Cancel stock transfer #${stockTransfer.number}`}
          description="This action cannot be undone."
          confirm={{
            // not just "Cancel": the dialog's own dismiss button says that
            label: getStockTransferTriggerAttributeName("_cancel"),
            variant: "danger",
            onClick: async () => {
              await dispatch("_cancel")
            },
          }}
          cancelLabel="Close"
        />
        <StockTransferInfo stockTransfer={stockTransfer} />
        <Spacer top="14">
          <StockTransferSummary stockTransfer={stockTransfer} />
        </Spacer>
        <div className="print:hidden">
          <Spacer top="14" bottom="4">
            <Timeline stockTransfer={stockTransfer} />
          </Spacer>
        </div>
      </SkeletonTemplate>
    </PageLayout>
  )
}

/** Map the canonical stock transfer display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getStockTransferDisplayStatus>["color"],
): BadgeProps["variant"] {
  switch (color) {
    case "green":
      return "success"
    case "orange":
      return "warning"
    case "red":
      return "danger"
    case "teal":
      return "teal"
    default:
      return "secondary"
  }
}
