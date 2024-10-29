import { appRoutes } from '#data/routes'
import {
  shipmentIncludeAttribute,
  useShipmentDetails
} from '#hooks/useShipmentDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'

export function useAsyncPurchase(shipmentId: string): {
  isPurchasing: boolean
  handlePurchase: (selectedRateId: string) => Promise<void>
} {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isPurchaseStarted, setIsPurchaseStarted] = useState<boolean>(false)
  const intervalId = useRef<NodeJS.Timeout | null>(null)

  const { shipment, mutateShipment, isPurchasing } = useShipmentDetails(
    shipmentId,
    false,
    false
  )

  const cleanUp = useCallback(() => {
    if (intervalId.current != null) {
      clearInterval(intervalId.current)
      intervalId.current = null
    }
  }, [intervalId.current])

  useEffect(() => {
    if (!isPolling) {
      cleanUp()
    }
    if (isPolling) {
      intervalId.current = setInterval(() => {
        void mutateShipment().then((_shipment) => {
          if (_shipment == null) return

          // purchase is success
          if (
            _shipment.purchase_started_at != null &&
            _shipment?.purchase_completed_at != null
          ) {
            setLocation(appRoutes.details.makePath({ shipmentId }))
          }

          // purchase is error
          if (_shipment?.purchase_failed_at != null) {
            setIsPolling(false)
            cleanUp()
          }
        })
      }, 800)
    }

    return () => {
      cleanUp()
    }
  }, [isPolling])

  const handlePurchase = async (selectedRateId: string): Promise<void> => {
    setIsPurchaseStarted(true)
    try {
      void sdkClient.shipments.update(
        {
          id: shipment.id,
          _purchase: true,
          selected_rate_id: selectedRateId
        },
        { include: shipmentIncludeAttribute }
      )
      setIsPolling(true)
      setIsPurchaseStarted(false)
    } catch {
      setIsPolling(false)
      setIsPurchaseStarted(false)
    }
  }

  return {
    isPurchasing: isPurchasing || isPurchaseStarted || isPolling,
    handlePurchase
  }
}
