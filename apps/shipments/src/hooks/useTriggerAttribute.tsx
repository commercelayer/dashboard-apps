import {
  shipmentIncludeAttribute,
  useShipmentDetails
} from '#hooks/useShipmentDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { type ShipmentUpdate } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

interface TriggerAttribute {
  isMutating: boolean
  errors?: string[]
  trigger: (
    triggerAttribute: Extract<keyof ShipmentUpdate, `_${string}`>
  ) => Promise<void>
}

export function useTriggerAttribute(id: string): TriggerAttribute {
  const { mutateShipment } = useShipmentDetails(id)
  const { sdkClient } = useCoreSdkProvider()

  const [isMutating, setIsMutating] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const trigger = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsMutating(true)
      setErrors(undefined)
      try {
        const updated = await sdkClient.shipments.update(
          {
            id,
            [triggerAttribute]: true
          },
          {
            include: shipmentIncludeAttribute
          }
        )
        void mutateShipment(updated)
      } finally {
        setIsMutating(false)
      }
    },
    [id]
  )

  return {
    isMutating,
    errors,
    trigger
  }
}
