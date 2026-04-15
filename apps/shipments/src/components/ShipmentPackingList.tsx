import { ShipmentProgress } from '#components/ShipmentProgress'
import { appRoutes } from '#data/routes'
import { usePickingList } from '#hooks/usePickingList'
import { useShipmentDetails } from '#hooks/useShipmentDetails'
import { useStockTransfersList } from '#hooks/useStockTransfersList'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import { useViewStatus } from '#hooks/useViewStatus'
import {
  ActionButtons,
  Alert,
  Hr,
  isAllStockTransfersCancelled,
  ResourceLineItems,
  ResourceShipmentParcels,
  Section,
  Spacer,
  Text,
  useCoreSdkProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Shipment as ShipmentResource } from '@commercelayer/sdk'
import { Link, useLocation } from 'wouter'

interface Props {
  shipment: ShipmentResource
}

export const ShipmentPackingList = withSkeletonTemplate<Props>(
  ({ shipment, isLoading }) => {
    const [, setLocation] = useLocation()
    const { trigger } = useTriggerAttribute(shipment.id)
    const pickingList = usePickingList(shipment)
    const stockTransfersList = useStockTransfersList(shipment)
    const stockItemsList = pickingList.concat(stockTransfersList)
    const viewStatus = useViewStatus(shipment)

    if (isLoading === true) {
      return null
    }

    // No parcels already created and no items to pick, there's nothing the user can do here
    if (stockItemsList.length === 0 && (shipment.parcels ?? []).length === 0) {
      return isAllStockTransfersCancelled(shipment) ? (
        <Alert status='error'>All stock transfers have been cancelled</Alert>
      ) : (
        <Text>No items found</Text>
      )
    }

    return (
      <Section
        title={viewStatus.title}
        border={stockItemsList.length > 0 ? undefined : 'none'}
        actionButton={
          viewStatus.headerAction == null ? null : (
            <Link
              href={appRoutes.packing.makePath({ shipmentId: shipment.id })}
            >
              {viewStatus.headerAction.label}
            </Link>
          )
        }
      >
        {viewStatus.progress === true && (
          <>
            <Spacer top='4' bottom='4'>
              <ShipmentProgress shipment={shipment} />
            </Spacer>
            <Hr />
          </>
        )}
        <ResourceLineItems items={stockItemsList} />
        <ParcelList shipment={shipment} showTitle={stockItemsList.length > 0} />
        <ActionButtons
          actions={
            viewStatus.footerActions?.map(
              ({ label, triggerAttribute, disabled, variant }) => ({
                label,
                disabled,
                variant,
                onClick: async () => {
                  if (triggerAttribute === '_create_parcel') {
                    if (shipment.status !== 'packing') {
                      await trigger('_packing')
                    }

                    setLocation(
                      appRoutes.packing.makePath({ shipmentId: shipment.id })
                    )
                    return
                  }

                  if (triggerAttribute === '_get_rates') {
                    setLocation(
                      appRoutes.purchase.makePath({ shipmentId: shipment.id })
                    )
                    return
                  }

                  void trigger(triggerAttribute)
                }
              })
            ) ?? []
          }
        />
      </Section>
    )
  }
)

const ParcelList = withSkeletonTemplate<{
  shipment: ShipmentResource
  showTitle: boolean
}>(({ shipment, showTitle }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { mutateShipment } = useShipmentDetails(shipment.id)
  const { t } = useTranslation()

  if ((shipment.parcels ?? []).length <= 0) {
    return null
  }

  return (
    <Spacer top={showTitle ? '8' : undefined}>
      <Section
        titleSize='small'
        title={showTitle ? t('resources.parcels.name_other') : undefined}
        border='none'
      >
        <ResourceShipmentParcels
          shipment={shipment}
          onRemoveParcel={(id) => {
            void sdkClient.parcels
              .delete(id)
              .then(async () => await mutateShipment())
          }}
        />
      </Section>
    </Spacer>
  )
})
