import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  ResourceListItem,
  Section,
  useAppLinking,
  useTokenProvider,
  useTrackingDetails,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order, Parcel, Shipment } from "@commercelayer/sdk"
import type { FC } from "react"
import type { SetNonNullable, SetRequired } from "type-fest"

interface Props {
  order: Order
}

const OrderShipment = ({
  shipment,
}: {
  shipment: Shipment
}): React.JSX.Element => {
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const navigateToShipment = canAccess("shipments")
    ? navigateTo({
        app: "shipments",
        resourceId: shipment.id,
      })
    : {}

  const parcelsWithTracking =
    shipment.parcels?.filter((parcel) => parcel.tracking_number) ?? []

  return (
    <div className="flex items-center">
      <ResourceListItem
        key={shipment.id}
        resource={shipment}
        {...navigateToShipment}
        rightContentOverride={parcelsWithTracking.length > 0 ? null : undefined}
      />
      <ShipmentTrackings parcels={parcelsWithTracking} />
    </div>
  )
}

const ShipmentTrackings: FC<{ parcels?: Parcel[] | null }> = ({ parcels }) => {
  if (parcels == null || parcels.length === 0) {
    return null
  }

  return (
    <div
      className="flex items-center border-b border-gray-100"
      style={{
        alignSelf: "stretch",
      }}
    >
      {parcels.length === 1 && parcels[0] != null ? (
        <ShipmentParcelTrackingItem as="button" parcel={parcels[0]} />
      ) : (
        <Dropdown
          dropdownLabel={
            <Button type="button" variant="circle">
              <Icon name="dotsThreeVertical" />
            </Button>
          }
          dropdownItems={parcels.map((parcel) => (
            <ShipmentParcelTrackingItem
              key={parcel.id}
              parcel={parcel}
              as="dropdownItem"
            />
          ))}
        />
      )}
    </div>
  )
}

const ShipmentParcelTrackingItem: FC<{
  parcel: Parcel
  as: "button" | "dropdownItem"
}> = ({ parcel, as }) => {
  const { TrackingDetailsModal, openTrackingDetails } =
    useTrackingDetails(parcel)

  return (
    <>
      <TrackingDetailsModal />
      {as === "button" ? (
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={openTrackingDetails}
        >
          Tracking
        </Button>
      ) : (
        <DropdownItem
          label={parcel.tracking_number ?? parcel.id}
          onClick={openTrackingDetails}
        />
      )}
    </>
  )
}

function hasShipments(
  order: Order,
): order is SetRequired<SetNonNullable<Order, "shipments">, "shipments"> {
  return (
    order.shipments != null &&
    order.shipments.length > 0 &&
    order.shipments.filter((shipment) =>
      ["draft", "cancelled"].includes(shipment.status),
    ).length === 0
  )
}

export const OrderShipments = withSkeletonTemplate<Props>(({ order }) => {
  const { t } = useTranslation()

  if (!hasShipments(order)) {
    return null
  }

  return (
    <Section
      title={t("resources.shipments.name", {
        count: order.shipments.length,
      })}
    >
      {order?.shipments?.map((shipment) => (
        <OrderShipment key={shipment.id} shipment={shipment} />
      ))}
    </Section>
  )
})
