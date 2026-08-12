import {
  Button,
  EmptyState,
  isMockedId,
  PageHeading,
  type PageHeadingProps,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { SkuDescription } from "dashboard-apps-common/src/components/SkuDescription"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { type FC, useEffect } from "react"
import { useLocation, useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { BundleInfo } from "#components/BundleInfo"
import { BundleSkuList } from "#components/BundleSkuList"
import { appRoutes } from "#data/routes"
import { useBundleDetails } from "#hooks/useBundleDetails"

export const BundleDetails: FC = () => {
  const { canUser } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ bundleId: string }>(appRoutes.details.path)

  const bundleId = params?.bundleId ?? ""

  const {
    settings: { extras },
  } = useTokenProvider()

  const { bundle, isLoading, error, mutateBundle } = useBundleDetails(bundleId)

  const { sdkClient } = useCoreSdkProvider()

  const queryString = useSearch()

  // The drawer is driven by the route: it is open for as long as this component
  // is mounted, and closing it means navigating away.
  const { Overlay: DetailsDrawer, open: openDrawer } = useOverlay()

  useEffect(() => {
    openDrawer()
  }, [openDrawer])

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the bundle was opened from one; within
    // the app it falls back to the list, keeping the filters the url carries.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: bundleId,
      defaultRelativePath:
        search !== ""
          ? appRoutes.home.makePath({}, search)
          : appRoutes.home.makePath({}),
    })
  }

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  const pageTitle = bundle.name ?? "Bundles"

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (canUser("update", "bundles")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(appRoutes.edit.makePath({ bundleId }))
        },
      },
    ])
  }

  if (canUser("destroy", "bundles")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Delete",
        onClick: () => {
          showDeleteDialog()
        },
      },
    ])
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "bundles",
      bundle.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Bundle"
            navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
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
    <DetailsDrawer drawer onBackdropClick={closeDrawer}>
      <div className="p-6">
        <PageHeading
          title={
            <SkeletonTemplate isLoading={isLoading}>
              {pageTitle}
            </SkeletonTemplate>
          }
          description={
            <SkeletonTemplate isLoading={isLoading}>
              {bundle.code}
            </SkeletonTemplate>
          }
          navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
          toolbar={pageToolbar}
          gap="only-top"
        />
        <>
          <SkeletonTemplate isLoading={isLoading}>
            <Spacer bottom="4">
              <Spacer top="14">
                <SkuDescription resource={bundle} />
              </Spacer>
              <Spacer top="14">
                <BundleSkuList bundle={bundle} />
              </Spacer>
              <Spacer top="14">
                <BundleInfo bundle={bundle} />
              </Spacer>
              <Spacer top="14">
                <ResourceDetails
                  resource={bundle}
                  onUpdated={async () => {
                    void mutateBundle()
                  }}
                />
              </Spacer>
              {!isMockedId(bundle.id) && (
                <>
                  <Spacer top="14">
                    <ResourceTags
                      resourceType="bundles"
                      resourceId={bundle.id}
                      overlay={{ title: pageTitle }}
                      onTagClick={(tagId) => {
                        setLocation(
                          appRoutes.list.makePath({}, `tags_id_in=${tagId}`),
                        )
                      }}
                    />
                  </Spacer>
                  <Spacer top="14">
                    <ResourceMetadata
                      resourceType="bundles"
                      resourceId={bundle.id}
                      overlay={{
                        title: pageTitle,
                      }}
                    />
                  </Spacer>
                </>
              )}
            </Spacer>
          </SkeletonTemplate>
          {canUser("destroy", "bundles") && (
            <ConfirmDialog
              icon="trash"
              title={`Delete bundle ${bundle.code}`}
              description="This action cannot be undone."
              confirm={{
                label: "Delete bundle",
                variant: "danger",
                onClick: async () => {
                  await sdkClient.bundles.delete(bundle.id)
                  setLocation(appRoutes.home.makePath({}))
                },
              }}
            />
          )}
        </>
      </div>
    </DetailsDrawer>
  )
}
