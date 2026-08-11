import {
  Button,
  EmptyState,
  Icon,
  isMockedId,
  PageHeading,
  type PageHeadingProps,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  removeFromResourceLists,
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
import { SkuDescription } from "dashboard-apps-common/src/components/SkuDescription"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { type FC, useEffect } from "react"
import { useLocation, useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { SkuInfo } from "#components/SkuInfo"
import { appRoutes } from "#data/routes"
import { useSkuDetails } from "#hooks/useSkuDetails"

export const SkuDetails: FC = () => {
  const {
    settings: { extras },
    canUser,
  } = useTokenProvider()
  const { goBack } = useAppLinking()
  const { sdkClient } = useCoreSdkProvider()

  const queryString = useSearch()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.details.path)

  const skuId = params?.skuId ?? ""

  const { sku, isLoading, error, mutateSku } = useSkuDetails(skuId)

  // The drawer is driven by the route: it is open for as long as this component
  // is mounted, and closing it means navigating away — back to wherever the user
  // came from, or to the list.
  const { Overlay: DetailsDrawer, open: openDrawer } = useOverlay()

  useEffect(() => {
    openDrawer()
  }, [openDrawer])

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the SKU was opened from one. Within the
    // app there is no saved entry, so it falls back here: the list, keeping the
    // filters that the details url carries.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: skuId,
      defaultRelativePath:
        search !== ""
          ? appRoutes.home.makePath({}, search)
          : appRoutes.home.makePath({}),
    })
  }

  // const { Overlay: SkuDeleteOverlay, show } = useSkuDeleteOverlay(sku)
  const { show, ConfirmDialog } = useConfirmDialog()

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
  const hasPublicMarkets =
    publicMarkets != null && publicMarkets.meta.recordCount > 0

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="SKU"
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

  const pageTitle = sku.name

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (canUser("update", "skus")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(appRoutes.edit.makePath({ skuId }))
        },
      },
    ])
  }

  // its own group, so a divider separates the destructive action
  if (canUser("destroy", "skus")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Delete",
        onClick: () => {
          show()
        },
      },
    ])
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "skus",
      sku.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  const tabs = ["general", "links"]
  const urlParams = new URLSearchParams(queryString)
  const defaultTab =
    urlParams.get("tab") != null
      ? (tabs.indexOf(urlParams.get("tab") ?? "") ?? 0)
      : 0

  const SkuInfos = (
    <>
      <Spacer top="10">
        <SkuInfo sku={sku} />
      </Spacer>
      {!isMockedId(sku.id) && (
        <>
          <Spacer top="14">
            <ResourceTags
              resourceType="skus"
              resourceId={sku.id}
              overlay={{ title: pageTitle }}
              onTagClick={(tagId) => {
                setLocation(appRoutes.home.makePath({}, `tags_id_in=${tagId}`))
              }}
            />
          </Spacer>
          <Spacer top="14">
            <ResourceMetadata
              resourceType="skus"
              resourceId={sku.id}
              overlay={{
                title: pageTitle,
              }}
            />
          </Spacer>
        </>
      )}
      {/* last, as in the reference: the technical fields are the least useful */}
      <Spacer top="14">
        <ResourceDetails
          resource={sku}
          onUpdated={async () => {
            void mutateSku()
          }}
        />
      </Spacer>
    </>
  )

  const SkuTabs = (
    <Tabs keepAlive defaultTab={defaultTab}>
      <Tab name="General">{SkuInfos}</Tab>
      <Tab name="Links">
        <Spacer top="10">
          <Section
            title="Links"
            border={hasSalesChannels && hasPublicMarkets ? "none" : undefined}
            actionButton={
              canUser("update", "skus") &&
              hasSalesChannels &&
              hasPublicMarkets && (
                <Button
                  size="mini"
                  variant="secondary"
                  alignItems="center"
                  onClick={() => {
                    setLocation(
                      appRoutes.linksNew.makePath({
                        resourceId: skuId,
                      }),
                    )
                  }}
                >
                  <Icon name="lightning" size={16} />
                  New link
                </Button>
              )
            }
          >
            {hasSalesChannels && hasPublicMarkets ? (
              <LinkListTable resourceId={skuId} resourceType="skus" />
            ) : (
              <LinksEmptyState
                scope={
                  !hasSalesChannels
                    ? "no-sales-channels"
                    : !hasPublicMarkets
                      ? "no-public-markets"
                      : "no-links"
                }
                resourceId={skuId}
                resourceType="skus"
              />
            )}
          </Section>
        </Spacer>
      </Tab>
    </Tabs>
  )

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
              {sku.code}
            </SkeletonTemplate>
          }
          navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
          toolbar={pageToolbar}
          gap="only-top"
        />
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom="4">
            <Spacer top="6">
              <SkuDescription resource={sku} />
            </Spacer>
            <Spacer top="6">{SkuTabs}</Spacer>
          </Spacer>
        </SkeletonTemplate>
        <ConfirmDialog
          icon="trash"
          title={`Delete SKU ${sku.code}`}
          description="This action cannot be undone."
          confirm={{
            label: "Delete",
            variant: "danger",
            onClick: async () => {
              await sdkClient.skus.delete(sku.id)
              // the list stays mounted under this drawer, so it has to be told
              removeFromResourceLists("skus", sku.id)
              setLocation(appRoutes.home.makePath({}))
            },
          }}
          successMessage={`SKU ${sku.code} deleted`}
        />
      </div>
    </DetailsDrawer>
  )
}
