import { FormPacking } from '#components/FormPacking'
import { ShipmentProgress } from '#components/ShipmentProgress'
import { appRoutes } from '#data/routes'
import { useCreateParcel } from '#hooks/useCreateParcel'
import { usePickingList } from '#hooks/usePickingList'
import { useShipmentDetails } from '#hooks/useShipmentDetails'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { useEffect } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function Packing(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.packing.path)
  const shipmentId = params?.shipmentId ?? ''
  const [, setLocation] = useLocation()
  const { shipment, isLoading } = useShipmentDetails(shipmentId)
  const pickingList = usePickingList(shipment)
  const isValidStatus = shipment?.status === 'packing'
  const { createParcelError, createParcelWithItems, isCreatingParcel } =
    useCreateParcel(shipmentId)
  const { t } = useTranslation()

  useEffect(() => {
    if (pickingList.length === 0 && !isMock(shipment)) {
      setLocation(appRoutes.details.makePath({ shipmentId }))
    }
  }, [pickingList])

  if (isMock(shipment) || isLoading) {
    return <div />
  }

  if (
    shipmentId == null ||
    !canUser('create', 'parcels') ||
    !isValidStatus ||
    shipment.stock_location?.id == null
  ) {
    return (
      <PageLayout
        title={t('resources.shipments.name_other')}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: t('resources.shipments.name_other'),
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title={
            !isValidStatus
              ? t('apps.shipments.details.not_in_packing')
              : shipment.stock_location?.id == null
                ? t('common.missing_resource', {
                    resource: t('resources.stock_locations.name')
                  })
                : t('common.not_authorized')
          }
          action={
            <Link
              href={
                shipmentId == null
                  ? appRoutes.home.makePath({})
                  : appRoutes.details.makePath({ shipmentId })
              }
            >
              <Button variant='primary'>{t('common.go_back')}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      overlay
      title={t('apps.shipments.tasks.packing')}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.details.makePath({ shipmentId }))
        },
        label: t('common.cancel'),
        icon: 'x'
      }}
      mode={mode}
      gap='only-top'
    >
      <Spacer bottom='12' top='6'>
        <ShipmentProgress shipment={shipment} />
      </Spacer>
      <Spacer bottom='12'>
        <FormPacking
          defaultValues={{
            items: pickingList.map((item) => ({
              quantity: item.quantity,
              value: item.id
            })),
            packageId: undefined,
            weight: '',
            unitOfWeight: undefined
          }}
          stockLineItems={pickingList}
          stockLocationId={shipment.stock_location.id}
          isSubmitting={isCreatingParcel}
          apiError={createParcelError}
          onSubmit={(formValues) => {
            void createParcelWithItems(formValues)
          }}
          shipment={shipment}
        />
      </Spacer>
    </PageLayout>
  )
}

export default Packing
