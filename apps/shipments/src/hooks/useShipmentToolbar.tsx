import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import { useViewStatus } from '#hooks/useViewStatus'
import { isMockedId } from '#mocks'
import { useEditMetadataOverlay } from '@commercelayer/app-elements'
import type { PageHeadingToolbarProps } from '@commercelayer/app-elements/dist/ui/atoms/PageHeading/PageHeadingToolbar'
import type { Shipment } from '@commercelayer/sdk'
import type { FC } from 'react'

export function useShipmentToolbar({ shipment }: { shipment: Shipment }): {
  props: PageHeadingToolbarProps
  /** Components to be mounted in page to supports actions in toolbar props (eg: overlays) */
  Components: FC
} {
  const { trigger } = useTriggerAttribute(shipment.id)
  const viewStatus = useViewStatus(shipment)

  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  const dropdownItems =
    viewStatus.contextActions?.map((action) => ({
      label: action.label,
      onClick: () => {
        if (action.triggerAttribute === '_create_parcel') {
          return
        }

        void trigger(action.triggerAttribute)
      }
    })) ?? []

  dropdownItems.push({
    label: 'Set metadata',
    onClick: () => {
      showEditMetadataOverlay()
    }
  })

  return {
    Components: () => (
      <>
        {!isMockedId(shipment.id) && (
          <EditMetadataOverlay
            resourceType={shipment.type}
            resourceId={shipment.id}
            title='Edit metadata'
            description={`Shipment #${shipment.number}`}
          />
        )}
      </>
    ),
    props: {
      dropdownItems: [dropdownItems]
    }
  }
}
