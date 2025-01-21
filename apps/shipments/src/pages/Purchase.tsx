import { appRoutes } from '#data/routes'
import { useAsyncPurchase } from '#hooks/useAsyncPurchase'
import { useShipmentDetails, useShipmentRates } from '#hooks/useShipmentDetails'
import { makeShipment } from '#mocks'
import {
  Alert,
  Avatar,
  Button,
  EmptyState,
  InputRadioGroup,
  ListItem,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  Text,
  getAvatarSrcFromRate,
  getShipmentRates,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function Purchase(): JSX.Element | null {
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.purchase.path)
  const { t } = useTranslation()
  const shipmentId = params?.shipmentId ?? ''

  const { shipment, isLoading } = useShipmentDetails(shipmentId)
  const hasBeenPurchased = shipment.purchase_completed_at != null

  if (isLoading) {
    return null
  }

  if (hasBeenPurchased) {
    return (
      <NotAuthorized
        shipmentId={shipmentId}
        title={t('apps.shipments.details.label_already_purchased')}
      />
    )
  }

  return <PurchaseShipment shipmentId={shipmentId} />
}

function PurchaseShipment({ shipmentId }: { shipmentId: string }): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [selectedRateId, setSelectedRateId] = useState<string | undefined>()

  const { isRefreshing } = useShipmentRates(shipmentId)
  const [isWaiting, setIsWaiting] = useState<boolean>(true)
  const [isReady, setIsReady] = useState<boolean>(false)
  const {
    shipment: fetchedShipment,
    mutateShipment,
    isLoading,
    isValidating,
    purchaseError
  } = useShipmentDetails(shipmentId, isRefreshing, false)
  const { handlePurchase, isPurchasing } = useAsyncPurchase(shipmentId)

  const shipment = useMemo(
    () => (isReady ? fetchedShipment : makeShipment()),
    [isReady, fetchedShipment]
  )

  const rates = useMemo(() => getShipmentRates(shipment), [shipment.rates])

  const selectedRate = useMemo(() => {
    return rates.find((rate) => rate.id === selectedRateId)
  }, [selectedRateId, rates])

  useEffect(
    function checkReady() {
      setIsReady(
        (ready) =>
          ready || !(isRefreshing || isLoading || isWaiting || isValidating)
      )
    },
    [isRefreshing, isLoading, isWaiting, isValidating]
  )

  useEffect(
    function refreshRates() {
      if (!isRefreshing) {
        setTimeout(() => {
          setIsWaiting(false)
          void mutateShipment()
        }, 5000)
      }
    },
    [isRefreshing]
  )

  const rateErrors = shipment.get_rates_errors?.map((error) =>
    isGetRatesError(error)
      ? `${error.carrier}: ${error.message ?? t('apps.shipments.details.get_rates_error')}`
      : t('apps.shipments.details.get_rates_error')
  )

  const options = useMemo(() => {
    return (
      rates.map((rate) => ({
        value: rate.id,
        content: (
          <ListItem
            alignItems='top'
            alignIcon='center'
            padding='none'
            borderStyle='none'
            icon={
              <Avatar
                src={getAvatarSrcFromRate(rate)}
                alt={rate.carrier}
                border='none'
                shape='circle'
                size='small'
              />
            }
          >
            <div>
              <Text size='regular' weight='bold'>
                {rate.service}
              </Text>
              {rate.carrier != null && (
                <Text size='small' tag='div' variant='info' weight='medium'>
                  {rate.carrier}
                </Text>
              )}
            </div>
            <Text size='regular' weight='bold'>
              {rate.formatted_rate}
            </Text>
          </ListItem>
        )
      })) ?? []
    )
  }, [shipment.rates])

  if (shipmentId === undefined || !canUser('update', 'shipments')) {
    return <NotAuthorized shipmentId={shipmentId} />
  }

  return (
    <PageLayout
      mode={mode}
      title={t('apps.shipments.details.select_rate')}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.details.makePath({ shipmentId }))
        },
        label: t('common.cancel'),
        icon: 'x'
      }}
    >
      <SkeletonTemplate isLoading={!isReady}>
        <InputRadioGroup
          name='carrier'
          options={options}
          onChange={(rateId) => {
            setSelectedRateId(rateId)
          }}
        />

        {rateErrors != null && rateErrors.length > 0 ? (
          <Spacer top='12'>
            <Alert status='error'>
              {rateErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </Alert>
          </Spacer>
        ) : null}
        {purchaseError != null ? (
          <Spacer top='12'>
            <Alert status='error'>{purchaseError}</Alert>
          </Spacer>
        ) : null}

        <Spacer top='12'>
          <SkeletonTemplate isLoading={false}>
            <Button
              fullWidth
              disabled={selectedRate == null || isPurchasing}
              onClick={() => {
                if (selectedRate != null) {
                  void handlePurchase(selectedRate.id)
                }
              }}
            >
              {!isReady
                ? t('apps.shipments.details.getting_rates')
                : isPurchasing
                  ? t('apps.shipments.details.purchasing')
                  : t('apps.shipments.actions.purchase_label')}
            </Button>
          </SkeletonTemplate>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

function NotAuthorized({
  shipmentId,
  title
}: {
  shipmentId: string
  title?: string
}): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  return (
    <PageLayout
      title={t('apps.shipments.details.select_rate')}
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
        title={title ?? t('common.not_authorized')}
        action={
          <Link href={appRoutes.details.makePath({ shipmentId })}>
            <Button variant='primary'>{t('common.go_back')}</Button>
          </Link>
        }
      />
    </PageLayout>
  )
}

interface GetRatesError {
  type: 'rate_error'
  carrier: string // eg:  "DHLExpress",
  message?: string // eg: "to_address: Invalid zip. Must be in the format: \\d\\d\\d\\d\\d"
}
function isGetRatesError(error: any): error is GetRatesError {
  return error.type === 'rate_error'
}

export default Purchase
