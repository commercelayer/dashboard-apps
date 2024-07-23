import { ShipmentAddresses } from '#components/ShipmentAddresses'
import { ShipmentInfo } from '#components/ShipmentInfo'
import { ShipmentPackingList } from '#components/ShipmentPackingList'
import { ShipmentSteps } from '#components/ShipmentSteps'
import { ShipmentTimeline } from '#components/ShipmentTimeline'
import { appRoutes } from '#data/routes'
import { useShipmentDetails } from '#hooks/useShipmentDetails'
import { useShipmentToolbar } from '#hooks/useShipmentToolbar'
import { isMockedId } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  Text,
  formatDate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { useLocation, useRoute } from 'wouter'

export function ShipmentDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.details.path)

  const shipmentId = params?.shipmentId ?? ''

  const { shipment, isLoading } = useShipmentDetails(shipmentId)
  const pageToolbar = useShipmentToolbar({ shipment })

  if (shipmentId === undefined || !canUser('read', 'orders')) {
    return (
      <PageLayout
        title='Orders'
        navigationButton={{
          onClick: () => {
            goBack({
              setLocation,
              defaultRelativePath: appRoutes.home.makePath({})
            })
          },
          label: 'Back',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Button
              variant='primary'
              onClick={() => {
                goBack({
                  setLocation,
                  defaultRelativePath: appRoutes.home.makePath({})
                })
              }}
            >
              Go back
            </Button>
          }
        />
      </PageLayout>
    )
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const pageTitle = `Shipment #${shipment.number}`

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar.props}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>{`Updated on ${formatDate({
            isoDate: shipment.updated_at,
            timezone: user?.timezone,
            format: 'full'
          })}`}</div>
          {!isEmpty(shipment.reference) && (
            <div>
              <Text variant='info'>Ref. {shipment.reference}</Text>
            </div>
          )}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.home.makePath({})
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <pageToolbar.Components />
        <Spacer bottom='4'>
          {!isMockedId(shipment.id) && (
            <Spacer top='6'>
              <ResourceTags
                resourceType='shipments'
                resourceId={shipment.id}
                overlay={{ title: 'Edit tags', description: pageTitle }}
                onTagClick={(tagId) => {
                  setLocation(
                    appRoutes.list.makePath({}, `tags_id_in=${tagId}`)
                  )
                }}
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <ShipmentSteps shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ShipmentInfo shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ShipmentPackingList shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ShipmentAddresses shipment={shipment} />
          </Spacer>
          {!isMockedId(shipment.id) && (
            <Spacer top='14'>
              <ResourceMetadata
                resourceType='shipments'
                resourceId={shipment.id}
                overlay={{
                  title: pageTitle
                }}
                mode='simple'
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <ShipmentTimeline shipment={shipment} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}
