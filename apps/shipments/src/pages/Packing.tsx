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
  useTokenProvider
} from '@commercelayer/app-elements'
import { useEffect } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function Packing(): JSX.Element {
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
        title='Shipments'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: 'Shipments',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title={
            !isValidStatus
              ? 'This shipment is not in packing status'
              : shipment.stock_location?.id == null
                ? 'Missing stock_location'
                : 'Not authorized'
          }
          action={
            <Link
              href={
                shipmentId == null
                  ? appRoutes.home.makePath({})
                  : appRoutes.details.makePath({ shipmentId })
              }
            >
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      overlay
      title='Packing'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.details.makePath({ shipmentId }))
        },
        label: `Cancel`,
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
            packageId: '',
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
