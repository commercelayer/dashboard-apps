import {
  Alert,
  Button,
  Card,
  EmptyState,
  formatDateWithPredicate,
  isMockedId,
  PageLayout,
  ResourceAttachments,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import isEmpty from "lodash-es/isEmpty"
import { useRoute } from "wouter"
import { ShipmentAddresses } from "#components/ShipmentAddresses"
import { ShipmentInfo } from "#components/ShipmentInfo"
import { ShipmentPackingList } from "#components/ShipmentPackingList"
import { ShipmentSteps } from "#components/ShipmentSteps"
import { ShipmentTimeline } from "#components/ShipmentTimeline"
import { appRoutes } from "#data/routes"
import { useShipmentDetails } from "#hooks/useShipmentDetails"
import { useShipmentToolbar } from "#hooks/useShipmentToolbar"

function ShipmentDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
    user,
  } = useTokenProvider()
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()
  const { t } = useTranslation()

  const shipmentId = params?.shipmentId ?? ""

  const { shipment, isLoading, error, mutateShipment, purchaseError } =
    useShipmentDetails(shipmentId)
  const pageToolbar = useShipmentToolbar({ shipment })

  if (shipmentId === undefined || !canUser("read", "orders") || error != null) {
    return (
      <PageLayout
        title={t("resources.shipments.name_other")}
        navigationButton={{
          onClick: () => {
            goBack({
              defaultRelativePath: appRoutes.home.makePath({}),
            })
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        mode={mode}
      >
        <EmptyState
          title={t("common.not_authorized")}
          description={t("common.not_authorized_description")}
          action={
            <Button
              variant="primary"
              onClick={() => {
                goBack({
                  defaultRelativePath: appRoutes.home.makePath({}),
                })
              }}
            >
              {t("common.go_back")}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = `${t("resources.shipments.name")} #${shipment.number}`

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "shipments",
      shipment.id,
      extras,
    )
    pageToolbar.props.buttons?.push(resourceInspectorButton)
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar.props}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: t("common.updated"),
              isoDate: shipment.updated_at,
              timezone: user?.timezone,
              locale: user?.locale,
              format: "full",
            })}
          </div>
          {!isEmpty(shipment.reference) && (
            <div>
              <Text variant="info">Ref. {shipment.reference}</Text>
            </div>
          )}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: shipmentId,
            defaultRelativePath: appRoutes.home.makePath({}),
          })
        },
        label: "",
        icon: "arrowLeft",
        variant: "button",
      }}
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer top="14">
            <Card overflow="visible">
              <ShipmentAddresses shipment={shipment} />
              <Spacer top="10">
                <ShipmentInfo shipment={shipment} />
              </Spacer>
              <Spacer top="10">
                <ResourceDetails
                  resource={shipment}
                  onUpdated={async () => {
                    void mutateShipment()
                  }}
                />
              </Spacer>
              {!isMockedId(shipment.id) && (
                <>
                  <Spacer top="10">
                    <ResourceTags
                      resourceType="shipments"
                      resourceId={shipment.id}
                      overlay={{ title: pageTitle }}
                    />
                  </Spacer>
                  <Spacer top="10">
                    <ResourceMetadata
                      resourceType="shipments"
                      resourceId={shipment.id}
                      overlay={{ title: pageTitle }}
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
            <ShipmentTimeline shipment={shipment} />
          </Spacer>
        </SkeletonTemplate>
      }
    >
      <SkeletonTemplate isLoading={isLoading}>
        <pageToolbar.Components />
        <Spacer bottom="4">
          <Spacer top="14">
            <ShipmentSteps shipment={shipment} />
          </Spacer>
          {purchaseError != null && (
            <Spacer top="14">
              <Alert status="error">{purchaseError}</Alert>
            </Spacer>
          )}
          <Spacer top="14">
            <ShipmentPackingList shipment={shipment} />
          </Spacer>
          <Spacer top="14">
            <ResourceAttachments
              resourceType="shipments"
              resourceId={shipment.id}
            />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ShipmentDetails
