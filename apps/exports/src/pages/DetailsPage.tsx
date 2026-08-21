import {
  Button,
  EmptyState,
  PageHeading,
  type PageHeadingProps,
  refreshResourceLists,
  removeFromResourceLists,
  SkeletonTemplate,
  Spacer,
  toast,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { ExportDate } from "#components/Details/ExportDate"
import { ExportDetails } from "#components/Details/ExportDetails"
import { ExportedResourceType } from "#components/Details/ExportedResourceType"
import { ExportReport } from "#components/Details/ExportReport"
import { ExportDetailsProvider } from "#components/Details/Provider"
import { StatusBadge } from "#components/Details/StatusBadge"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { appRoutes } from "#data/routes"

const DetailsPage = (): React.JSX.Element | null => {
  const {
    canUser,
    settings: { extras },
  } = useTokenProvider()
  const [_match, params] = useRoute<{ exportId?: string }>(
    appRoutes.details.path,
  )
  const exportId = params == null ? null : params.exportId
  const { goBack } = useAppLinking()
  const queryString = useSearch()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

  // The drawer is driven by the route: it is open for as long as this component
  // is mounted, and closing it means navigating away.
  const { Overlay: DetailsDrawer } = useOverlay({ initialOpen: true })

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the export was opened from one; within
    // the app it falls back to the list, keeping the url's filters.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: exportId ?? undefined,
      defaultRelativePath: appRoutes.list.makePath(search),
    })
  }

  if (exportId == null || !canUser("read", "exports")) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Export"
            gap="none"
            navigationButton={{
              onClick: closeDrawer,
              label: "",
              icon: "x",
              variant: "button",
            }}
          />
          <EmptyState
            title="Not authorized"
            action={
              <Button variant="primary" onClick={closeDrawer}>
                Go back
              </Button>
            }
          />
        </div>
      </DetailsDrawer>
    )
  }

  return (
    // The drawer is the outermost element, as in the other drawer apps: the data
    // provider polls a running export every few seconds, and anything mounted
    // above the drawer would take it down with it on each update.
    <DetailsDrawer drawer onBackdropClick={closeDrawer}>
      <div className="p-6">
        <ExportDetailsProvider exportId={exportId}>
          {({ state: { data, isLoading, isNotFound }, refetch }) =>
            isNotFound ? (
              <ErrorNotFound />
            ) : (
              <SkeletonTemplate isLoading={isLoading}>
                <PageHeading
                  title={
                    <div className="flex items-center gap-3">
                      {/* name and word in one flex item: a bare text node would be
                          an item of its own and take the gap too, reading as a
                          double space before "export" */}
                      <span>
                        <ExportedResourceType /> export
                      </span>
                      <StatusBadge job={data} />
                    </div>
                  }
                  description={
                    <ExportDate
                      atType={
                        data.status === "completed"
                          ? "completed_at"
                          : "started_at"
                      }
                      includeTime
                    />
                  }
                  navigationButton={{
                    onClick: closeDrawer,
                    label: "",
                    icon: "x",
                    variant: "button",
                  }}
                  toolbar={buildToolbar({
                    job: data,
                    exportId,
                    extras,
                    canUpdate: canUser("update", "exports"),
                    canDestroy: canUser("destroy", "exports"),
                    onPause: () => {
                      void runAction({
                        action: async () => {
                          await sdkClient.exports.update({
                            id: exportId,
                            _interrupt: true,
                          })
                        },
                        errorMessage: "Could not pause export",
                        refetch,
                      })
                    },
                    onResume: () => {
                      void runAction({
                        action: async () => {
                          await sdkClient.exports.update({
                            id: exportId,
                            _start: true,
                          })
                        },
                        errorMessage: "Could not resume export",
                        refetch,
                      })
                    },
                    onCancel: showCancelDialog,
                  })}
                  gap="none"
                />

                <Spacer bottom="14">
                  <ExportReport />
                </Spacer>

                <Spacer bottom="14">
                  <ExportDetails />
                </Spacer>

                <Spacer bottom="14">
                  <ResourceInfoBlocks
                    resource={data}
                    title={"Back"}
                    onUpdated={async () => {
                      void refetch()
                    }}
                  />
                </Spacer>

                <ConfirmDialog
                  icon="xCircle"
                  title="Cancel export"
                  description="This action cannot be undone."
                  confirm={{
                    // not just "Cancel": the dialog's own dismiss button says that
                    label: "Cancel export",
                    variant: "danger",
                    onClick: async () => {
                      // a running export has to be stopped before it can be deleted
                      await sdkClient.exports.update({
                        id: exportId,
                        _interrupt: true,
                      })
                      await sdkClient.exports.delete(exportId)
                      removeFromResourceLists("exports", exportId)
                      closeDrawer()
                    },
                  }}
                  cancelLabel="Close"
                />
              </SkeletonTemplate>
            )
          }
        </ExportDetailsProvider>
      </div>
    </DetailsDrawer>
  )
}

/**
 * The header's right hand side: the resource inspector, plus the same actions the
 * table row offers, each only when it can do something.
 */
function buildToolbar({
  job,
  exportId,
  extras,
  canUpdate,
  canDestroy,
  onPause,
  onResume,
  onCancel,
}: {
  job: Export
  exportId: string
  extras: ReturnType<typeof useTokenProvider>["settings"]["extras"]
  canUpdate: boolean
  canDestroy: boolean
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}): PageHeadingProps["toolbar"] {
  const toolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (extras?.openResourceModal != null) {
    toolbar.buttons?.push(getResourceModalButton("exports", exportId, extras))
  }

  const isRunning = job.status === "pending" || job.status === "in_progress"
  const actions: NonNullable<
    NonNullable<PageHeadingProps["toolbar"]>["dropdownItems"]
  >[number] = []

  if (job.status === "interrupted" && canUpdate) {
    actions.push({ label: "Resume", icon: "play", onClick: onResume })
  }

  if (isRunning && canUpdate) {
    actions.push({ label: "Pause", icon: "pause", onClick: onPause })
  }

  if ((isRunning || job.status === "interrupted") && canDestroy) {
    actions.push({ label: "Cancel", icon: "xCircle", onClick: onCancel })
  }

  if (actions.length > 0) {
    toolbar.dropdownItems?.push(actions)
  }

  return toolbar
}

async function runAction({
  action,
  errorMessage,
  refetch,
}: {
  action: () => Promise<void>
  errorMessage: string
  refetch: () => Promise<void>
}): Promise<void> {
  try {
    await action()
    await refetch()
    // the row in the list behind the drawer shows the same status
    refreshResourceLists("exports")
  } catch {
    toast(errorMessage, { type: "error" })
  }
}

export default DetailsPage
