import { isMockedId, makeShipment } from '#mocks'
import { useCoreApi, useTranslation } from '@commercelayer/app-elements'

export const shipmentIncludeAttribute = [
  'order',
  'order.customer',
  'shipping_method',
  'shipping_address',
  'stock_location',
  'origin_address',
  'stock_line_items',
  'stock_line_items.sku',
  'stock_transfers',
  'stock_transfers.line_item', // Required to fill fake stock line items from stock transfers in picking list
  'stock_transfers.origin_stock_location',

  'parcels',
  'parcels.package',
  'parcels.parcel_line_items',
  'parcels.attachments',

  'carrier_accounts'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useShipmentDetails(
  id: string,
  paused: boolean = false,
  shouldRevalidate: boolean = true
) {
  const { t } = useTranslation()
  const {
    data: shipment,
    isLoading,
    mutate: mutateShipment,
    isValidating
  } = useCoreApi(
    'shipments',
    'retrieve',
    [id, { include: shipmentIncludeAttribute }],
    {
      isPaused: () => isMockedId(id) || paused,
      fallbackData: makeShipment(),
      ...(shouldRevalidate
        ? {}
        : {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false
          })
    }
  )

  const isPurchasing =
    shipment.purchase_started_at != null &&
    shipment.purchase_completed_at == null
  const isPurchased =
    shipment.purchase_started_at != null &&
    shipment.purchase_completed_at != null

  // Purchase error state cannot be reproduces in easypost sandbox. A real case example would be:
  //  purchase_error_code: 'SHIPMENT.POSTAGE.FAILURE',
  //  purchase_error_message: 'The system could not verify your shipping account number. Please correct this number and resubmit.For assistance call DHL customer services',
  const purchaseError =
    shipment.purchase_failed_at != null
      ? `${shipment.purchase_error_code} ${shipment.purchase_error_message ?? t('apps.shipments.details.purchase_label_error')}`
      : null

  return {
    shipment,
    isLoading,
    mutateShipment,
    isValidating,
    isPurchasing,
    isPurchased,
    purchaseError
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useShipmentRates(shipmentId: string) {
  const { isLoading: isRefreshing } = useCoreApi(
    'shipments',
    'update',
    [
      {
        id: shipmentId,
        _get_rates: true
      },
      { include: shipmentIncludeAttribute }
    ],
    {
      isPaused: () => isMockedId(shipmentId),
      fallbackData: makeShipment(),
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false
    }
  )

  return {
    isRefreshing
  }
}
