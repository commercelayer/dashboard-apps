import {
  Alert,
  Button,
  EmptyState,
  formatDateWithPredicate,
  PageLayout,
  ResourceAttachments,
  SkeletonTemplate,
  Spacer,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import isEmpty from "lodash-es/isEmpty"
import { useRoute } from "wouter"
import { ShipmentAddresses } from "#components/ShipmentAddresses"
import { ShipmentInfo } from "#components/ShipmentInfo"
import { ShipmentPackingList } from "#components/ShipmentPackingList"
import { ShipmentStatusBadge } from "#components/ShipmentStatusBadge"
import { ShipmentTimeline } from "#components/ShipmentTimeline"
import { appRoutes } from "#data/routes"
import { useActiveStockTransfers } from "#hooks/useActiveStockTransfers"
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
  const activeStockTransfers = useActiveStockTransfers(shipment)

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
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}
          <ShipmentStatusBadge
            shipment={shipment}
            awaitingStockTransfer={
              shipment.status === "on_hold" && activeStockTransfers.length > 0
            }
          />
        </SkeletonTemplate>
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
      // no bottom gap under the heading: the main column opens with a
      // `Spacer top="14"`, which is what the sidebar column lines up with
      gap="only-top"
      fullWidth
      alert={
        purchaseError != null && <Alert status="error">{purchaseError}</Alert>
      }
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <ShipmentAddresses shipment={shipment} />
          <div className="mt-14 lg:mt-10">
            <ResourceInfoBlocks
              resource={shipment}
              title={pageTitle}
              onUpdated={async () => {
                void mutateShipment()
              }}
            />
          </div>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
    >
      <SkeletonTemplate isLoading={isLoading}>
        <pageToolbar.Components />
            <ShipmentInfo shipment={shipment} />
          <Spacer top="14">
            <ShipmentPackingList shipment={shipment} />
          </Spacer>
          <Spacer top="14">
            <ResourceAttachments
              resourceType="shipments"
              resourceId={shipment.id}
            />
          </Spacer>
          <Spacer top="14">
            <ShipmentTimeline shipment={shipment} />
          </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ShipmentDetails
