import {
  Badge,
  Button,
  EmptyState,
  getReturnDisplayStatus,
  type PageHeadingProps,
  PageLayout,
  ResourceAttachments,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { Link, useLocation, useRoute } from "wouter"
import { ReturnAddresses } from "#components/ReturnAddresses"
import { ReturnInfo } from "#components/ReturnInfo"
import { ReturnSummary } from "#components/ReturnSummary"
import { ScrollToTop } from "#components/ScrollToTop"
import { Timeline } from "#components/Timeline"
import {
  getReturnStatusBadgeVariant,
  getReturnTriggerAttributeName,
} from "#data/dictionaries"
import { appRoutes } from "#data/routes"
import { useReturnDetails } from "#hooks/useReturnDetails"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"

function ReturnDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [, params] = useRoute<{ returnId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()

  const returnId = params?.returnId ?? ""

  const { dispatch: dispatchTrigger, isLoading: isTriggering } =
    useTriggerAttribute(returnId)

  const { returnObj, isLoading, mutateReturn, error } =
    useReturnDetails(returnId)

  if (returnId === undefined || !canUser("read", "returns") || error != null) {
    return (
      <PageLayout
        title={t("resources.returns.name_other")}
        navigationButton={{
          label: "",
          icon: "arrowLeft",
          variant: "button",
          onClick: () => {
            setLocation(appRoutes.home.makePath())
          },
        }}
        mode={mode}
      >
        <EmptyState
          title={t("common.not_authorized")}
          description={t("common.not_authorized_description")}
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant="primary">{t("common.routes.go_home")}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = `${t("resources.returns.name")} #${returnObj.number}`

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "returns",
      returnObj.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  // Archiving is filing a return away rather than moving it along, so it belongs
  // with the page's own actions and not among the lifecycle buttons under the
  // items. Only a cancelled return can be filed, as before.
  if (returnObj.status === "cancelled" && canUser("update", "returns")) {
    const archiveTrigger =
      returnObj.archived_at == null ? "_archive" : "_unarchive"
    pageToolbar.dropdownItems?.push([
      {
        label: getReturnTriggerAttributeName(archiveTrigger),
        disabled: isTriggering,
        onClick: () => {
          void dispatchTrigger(archiveTrigger)
        },
      },
    ])
  }

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}{" "}
          <Badge
            variant={getReturnStatusBadgeVariant(
              getReturnDisplayStatus(returnObj).color,
            )}
          >
            {getReturnDisplayStatus(returnObj).label}
          </Badge>
        </SkeletonTemplate>
      }
      navigationButton={{
        label: "",
        icon: "arrowLeft",
        variant: "button",
        onClick: () => {
          goBack({
            currentResourceId: returnId,
            defaultRelativePath: appRoutes.home.makePath(),
          })
        },
      }}
      toolbar={pageToolbar}
      // no bottom gap under the heading: the main column opens with a
      // `Spacer top="14"`, which is what the sidebar column lines up with
      gap="only-top"
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <ReturnAddresses returnObj={returnObj} />
          <Spacer top={{ base: "14", lg: "10" }}>
            <ResourceInfoBlocks
              resource={returnObj}
              title={pageTitle}
              onUpdated={async () => {
                void mutateReturn()
              }}
            />
          </Spacer>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
    >
      <ScrollToTop />
      <SkeletonTemplate isLoading={isLoading}>
        <ReturnInfo returnObj={returnObj} />
        <Spacer top="14">
          <ReturnSummary returnObj={returnObj} />
        </Spacer>
        <Spacer top="14">
          <ResourceAttachments
            resourceType="returns"
            resourceId={returnObj.id}
          />
        </Spacer>
        <Spacer top="14">
          <Timeline returnObj={returnObj} />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ReturnDetails
