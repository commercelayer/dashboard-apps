import {
  Button,
  EmptyState,
  PageHeading,
  type PageHeadingProps,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { ImportDate } from "#components/Details/ImportDate"
import { ImportDetails } from "#components/Details/ImportDetails"
import { ImportedResourceType } from "#components/Details/ImportedResourceType"
import { ImportReport } from "#components/Details/ImportReport"
import { ImportDetailsProvider } from "#components/Details/Provider"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { appRoutes } from "#data/routes"

const DetailsPage = (): React.JSX.Element | null => {
  const {
    canUser,
    settings: { extras },
  } = useTokenProvider()
  const [_match, params] = useRoute<{ importId?: string }>(
    appRoutes.details.path,
  )
  const importId = params == null ? null : params.importId
  const { goBack } = useAppLinking()
  const queryString = useSearch()

  // The drawer is driven by the route: it is open for as long as this component
  // is mounted, and closing it means navigating away.
  const { Overlay: DetailsDrawer } = useOverlay({ initialOpen: true })

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the import was opened from one; within
    // the app it falls back to the list, keeping the url's filters.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: importId ?? undefined,
      defaultRelativePath: appRoutes.list.makePath(search),
    })
  }

  if (importId == null || !canUser("read", "imports")) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Import"
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

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "imports",
      importId,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  return (
    // The drawer is the outermost element, as in the other drawer apps: the data
    // provider polls a running import every few seconds, and anything mounted
    // above the drawer would take it down with it on each update.
    <DetailsDrawer drawer onBackdropClick={closeDrawer}>
      <div className="p-6">
        <ImportDetailsProvider importId={importId}>
          {({ state: { data, isLoading, isNotFound }, refetch }) =>
            isNotFound ? (
              <ErrorNotFound />
            ) : (
              <SkeletonTemplate isLoading={isLoading}>
                <PageHeading
                  title={<ImportedResourceType />}
                  description={<ImportDate atType="created_at" includeTime />}
                  navigationButton={{
                    onClick: closeDrawer,
                    label: "",
                    icon: "x",
                    variant: "button",
                  }}
                  toolbar={pageToolbar}
                  gap="none"
                />
                <Spacer bottom="14">
                  <ImportReport />
                </Spacer>

                <Spacer bottom="14">
                  <ImportDetails />
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
              </SkeletonTemplate>
            )
          }
        </ImportDetailsProvider>
      </div>
    </DetailsDrawer>
  )
}

export default DetailsPage
