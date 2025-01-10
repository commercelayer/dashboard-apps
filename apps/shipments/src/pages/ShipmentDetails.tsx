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
  Alert,
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  Text,
  formatDateWithPredicate,
  useAppLinking,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { useRoute } from 'wouter'

function ShipmentDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()
  const { t } = useTranslation()

  const shipmentId = params?.shipmentId ?? ''

  const { shipment, isLoading, mutateShipment, purchaseError } =
    useShipmentDetails(shipmentId)
  const pageToolbar = useShipmentToolbar({ shipment })

  if (shipmentId === undefined || !canUser('read', 'orders')) {
    return (
      <PageLayout
        title={t('resources.shipments.name_other')}
        navigationButton={{
          onClick: () => {
            goBack({
              defaultRelativePath: appRoutes.home.makePath({})
            })
          },
          label: t('common.back'),
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
          action={
            <Button
              variant='primary'
              onClick={() => {
                goBack({
                  defaultRelativePath: appRoutes.home.makePath({})
                })
              }}
            >
              {t('common.go_back')}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = `${t('resources.shipments.name')} #${shipment.number}`

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
              predicate: t('common.updated'),
              isoDate: shipment.updated_at,
              timezone: user?.timezone,
              locale: user?.locale,
              format: 'full'
            })}
          </div>
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
            currentResourceId: shipmentId,
            defaultRelativePath: appRoutes.home.makePath({})
          })
        },
        label: t('common.back'),
        icon: 'arrowLeft'
      }}
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <pageToolbar.Components />
        <Spacer bottom='4'>
          <Spacer top='14'>
            <ShipmentSteps shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ShipmentInfo shipment={shipment} />
          </Spacer>
          {purchaseError != null && (
            <Spacer top='14'>
              <Alert status='error'>{purchaseError}</Alert>
            </Spacer>
          )}
          <Spacer top='14'>
            <ShipmentPackingList shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ShipmentAddresses shipment={shipment} />
          </Spacer>
          <Spacer top='14'>
            <ResourceDetails
              resource={shipment}
              onUpdated={async () => {
                void mutateShipment()
              }}
            />
          </Spacer>
          {!isMockedId(shipment.id) && (
            <>
              <Spacer top='14'>
                <ResourceTags
                  resourceType='shipments'
                  resourceId={shipment.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
              <Spacer top='14'>
                <ResourceMetadata
                  resourceType='shipments'
                  resourceId={shipment.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
            </>
          )}
          <Spacer top='14'>
            <ShipmentTimeline shipment={shipment} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ShipmentDetails
