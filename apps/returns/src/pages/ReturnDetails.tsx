import {
  Button,
  Card,
  EmptyState,
  isMockedId,
  type PageHeadingProps,
  PageLayout,
  ResourceAttachments,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { Link, useLocation, useRoute } from "wouter"
import { ReturnAddresses } from "#components/ReturnAddresses"
import { ReturnInfo } from "#components/ReturnInfo"
import { ReturnSteps } from "#components/ReturnSteps"
import { ReturnSummary } from "#components/ReturnSummary"
import { ScrollToTop } from "#components/ScrollToTop"
import { Timeline } from "#components/Timeline"
import { appRoutes } from "#data/routes"
import { useReturnDetails } from "#hooks/useReturnDetails"

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

  const { returnObj, isLoading, mutateReturn, error } =
    useReturnDetails(returnId)

  if (returnId === undefined || !canUser("read", "returns") || error != null) {
    return (
      <PageLayout
        title={t("resources.returns.name_other")}
        navigationButton={{
          label: t("common.back"),
          icon: "arrowLeft",
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

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        label: t("resources.returns.name_other"),
        icon: "arrowLeft",
        onClick: () => {
          goBack({
            currentResourceId: returnId,
            defaultRelativePath: appRoutes.home.makePath(),
          })
        },
      }}
      toolbar={pageToolbar}
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer top="14">
            <Card overflow="visible">
              <ReturnAddresses returnObj={returnObj} />
              <Spacer top="10">
                <ResourceDetails
                  resource={returnObj}
                  onUpdated={async () => {
                    void mutateReturn()
                  }}
                />
              </Spacer>
              {!isMockedId(returnObj.id) && (
                <>
                  <Spacer top="10">
                    <ResourceTags
                      resourceType="returns"
                      resourceId={returnObj.id}
                      overlay={{
                        title: pageTitle,
                      }}
                    />
                  </Spacer>
                  <Spacer top="10">
                    <ResourceMetadata
                      resourceType="returns"
                      resourceId={returnObj.id}
                      overlay={{
                        title: pageTitle,
                      }}
                    />
                  </Spacer>
                </>
              )}
            </Card>
          </Spacer>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
      afterSidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer top="14" bottom="4">
            <Timeline returnObj={returnObj} />
          </Spacer>
        </SkeletonTemplate>
      }
    >
      <ScrollToTop />
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom="4">
          <ReturnSteps returnObj={returnObj} />
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
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ReturnDetails
