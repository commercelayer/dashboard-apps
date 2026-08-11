import {
  Alert,
  Button,
  CodeBlock,
  EmptyState,
  Icon,
  isMockedId,
  PageHeading,
  type PageHeadingProps,
  ResourceDetails,
  ResourceMetadata,
  Section,
  SkeletonTemplate,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useConfirmDialog,
  useCoreApi,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { LinkListTable } from "dashboard-apps-common/src/components/LinkListTable"
import { LinksEmptyState } from "dashboard-apps-common/src/components/LinksEmptyState"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useEffect } from "react"
import { useLocation, useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { SkuListManualItems } from "#components/SkuListManualItems"
import { appRoutes } from "#data/routes"
import { useSkuListDetails } from "#hooks/useSkuListDetails"

export const SkuListDetails = (): React.JSX.Element => {
  const {
    settings: { extras },
    canUser,
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const queryString = useSearch()

  const [, setLocation] = useLocation()
  // rendered as a sibling of the list rather than by a `Route`, so the id comes
  // from matching the route here
  const [, params] = useRoute<{ skuListId: string }>(appRoutes.details.path)
  const skuListId = params?.skuListId ?? ""

  const { skuList, isLoading, error, mutateSkuList } =
    useSkuListDetails(skuListId)

  const { sdkClient } = useCoreSdkProvider()
  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  // The drawer is driven by the route: open while this component is mounted, and
  // closing means navigating away.
  const { Overlay: DetailsDrawer, open: openDrawer } = useOverlay()

  useEffect(() => {
    openDrawer()
  }, [openDrawer])

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the list was opened from one; within
    // the app it falls back to the list, keeping whatever the url carries.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: skuListId,
      defaultRelativePath:
        search !== ""
          ? appRoutes.home.makePath({}, search)
          : appRoutes.home.makePath({}),
    })
  }

  const hasSalesChannels =
    extras?.salesChannels != null && extras?.salesChannels.length > 0

  const { data: publicMarkets } = useCoreApi(
    "markets",
    "list",
    [
      {
        fields: ["id"],
        filters: {
          customer_group_null: true,
          private_true: false,
          disabled_at_null: true,
        },
        pageSize: 1,
      },
    ],
    {},
  )

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="SKU List"
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

  const pageTitle = skuList?.name
  const hasBundles = skuList?.bundles != null && skuList?.bundles.length > 0
  const isManual = skuList?.manual === true
  const isAutomatic =
    skuList?.manual === false && skuList.sku_code_regex != null

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  const hasPublicMarkets =
    publicMarkets != null && publicMarkets.meta.recordCount > 0

  const tabs = ["items", "links", "info"]
  const urlParams = new URLSearchParams(queryString)
  const defaultTab =
    urlParams.get("tab") != null
      ? (tabs.indexOf(urlParams.get("tab") ?? "") ?? 0)
      : 0

  if (canUser("update", "sku_lists")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(appRoutes.edit.makePath({ skuListId }))
        },
      },
    ])
  }

  // its own group, so a divider separates the destructive action
  if (canUser("destroy", "sku_lists")) {
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
      "sku_lists",
      skuList.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
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
          navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
          toolbar={pageToolbar}
          gap="only-top"
        />
        <Spacer top="6" bottom="4">
          <Tabs keepAlive defaultTab={defaultTab}>
            <Tab name="Items">
              {isManual && (
                <>
                  {hasBundles && (
                    <Spacer top="10" bottom="14">
                      <Alert status="info">
                        Items in a SKU List linked to a Bundle cannot be
                        modified.
                      </Alert>
                    </Spacer>
                  )}
                  <SkuListManualItems
                    skuListId={skuListId}
                    hasBundles={hasBundles}
                  />
                </>
              )}
              {isAutomatic && (
                <Spacer top="10">
                  <CodeBlock
                    hint={{
                      text: "Matching SKU codes are automatically included to this list.",
                    }}
                  >
                    {skuList.sku_code_regex ?? ""}
                  </CodeBlock>
                </Spacer>
              )}
            </Tab>
            <Tab name="Links">
              <Spacer top="10">
                <Section
                  title="Links"
                  border={
                    hasSalesChannels && hasPublicMarkets ? "none" : undefined
                  }
                  actionButton={
                    canUser("update", "sku_lists") &&
                    hasSalesChannels &&
                    hasPublicMarkets && (
                      <Button
                        size="mini"
                        variant="secondary"
                        alignItems="center"
                        onClick={() => {
                          setLocation(
                            appRoutes.linksNew.makePath({
                              resourceId: skuListId,
                            }),
                          )
                        }}
                      >
                        <Icon name="lightning" size="16" />
                        New link
                      </Button>
                    )
                  }
                >
                  {hasSalesChannels && hasPublicMarkets ? (
                    <LinkListTable
                      resourceId={skuListId}
                      resourceType="sku_lists"
                    />
                  ) : (
                    <LinksEmptyState
                      scope={
                        !hasSalesChannels
                          ? "no-sales-channels"
                          : !hasPublicMarkets
                            ? "no-public-markets"
                            : "no-links"
                      }
                      resourceId={skuListId}
                      resourceType="sku_lists"
                    />
                  )}
                </Section>
              </Spacer>
            </Tab>
            <Tab name="Info">
              <Spacer top="10">
                <ResourceDetails
                  resource={skuList}
                  onUpdated={async () => {
                    void mutateSkuList()
                  }}
                />
              </Spacer>
              {!isMockedId(skuList.id) && (
                <Spacer top="14">
                  <ResourceMetadata
                    resourceType="sku_lists"
                    resourceId={skuList.id}
                    overlay={{
                      title: pageTitle,
                    }}
                  />
                </Spacer>
              )}
            </Tab>
          </Tabs>
        </Spacer>
        {canUser("destroy", "sku_lists") && (
          <ConfirmDialog
            icon="trash"
            title={`Delete SKU list ${skuList?.name}`}
            description="This action cannot be undone."
            confirm={{
              label: "Delete SKU list",
              variant: "danger",
              onClick: async () => {
                await sdkClient.sku_lists.delete(skuList.id).then(() => {
                  setLocation(appRoutes.list.makePath({}))
                })
              },
            }}
          />
        )}
      </div>
    </DetailsDrawer>
  )
}
