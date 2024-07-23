import { appRoutes } from '#data/routes'
import { isMock, makePriceTier } from '#mocks'
import type { PriceTierType } from '#types'
import { getPriceTierSdkResource, getUpToForTable } from '#utils/priceTiers'
import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  PageLayout,
  Td,
  Tr,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type {
  Price,
  PriceFrequencyTier,
  PriceVolumeTier
} from '@commercelayer/sdk'

import { useState } from 'react'
import type { KeyedMutator } from 'swr'
import { useLocation, useRoute } from 'wouter'

interface Props {
  type: PriceTierType
  resource: PriceFrequencyTier | PriceVolumeTier
  mutatePrice: KeyedMutator<Price>
}

export const TableItemPriceTier = withSkeletonTemplate<Props>(
  ({ type, resource = makePriceTier(type), mutatePrice }) => {
    const [, params] = useRoute<{ priceListId: string; priceId: string }>(
      appRoutes.priceDetails.path
    )
    const priceListId = params?.priceListId ?? ''
    const priceId = params?.priceId ?? ''

    const [, setLocation] = useLocation()
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()

    const { Overlay, open, close } = useOverlay()

    const [isDeleteting, setIsDeleting] = useState(false)

    const sdkResource = getPriceTierSdkResource(type)
    const appRoutesPath =
      type === 'frequency' ? 'priceFrequencyTierEdit' : 'priceVolumeTierEdit'

    const contextMenuEdit = canUser('update', sdkResource) &&
      !isMock(resource) && (
        <DropdownItem
          label='Edit'
          onClick={() => {
            setLocation(
              appRoutes[appRoutesPath].makePath({
                priceListId,
                priceId,
                tierId: resource.id
              })
            )
          }}
        />
      )

    const contextMenuDivider = canUser('update', sdkResource) &&
      canUser('destroy', sdkResource) && <DropdownDivider />

    const contextMenuDelete = canUser('destroy', sdkResource) && (
      <DropdownItem
        label='Delete'
        onClick={() => {
          open()
        }}
      />
    )

    const contextMenu = (
      <Dropdown
        dropdownLabel={<Icon name='dotsThree' size={24} />}
        dropdownItems={
          <>
            {contextMenuEdit}
            {contextMenuDivider}
            {contextMenuDelete}
          </>
        }
      />
    )

    return (
      <>
        <Tr key={resource.id}>
          <Td>{resource.name}</Td>
          <Td>{getUpToForTable(resource?.up_to, type)}</Td>
          <Td>{resource.formatted_price_amount}</Td>
          <Td align='right'>{contextMenu}</Td>
        </Tr>
        {canUser('destroy', sdkResource) && (
          <Overlay>
            <PageLayout
              title={`Confirm that you want to delete the price ${type} tier with name ${resource.name}.`}
              description='This action cannot be undone, proceed with caution.'
              minHeight={false}
              navigationButton={{
                label: 'Cancel',
                icon: 'x',
                onClick: () => {
                  close()
                }
              }}
            >
              <Button
                variant='danger'
                size='small'
                disabled={isDeleteting}
                onClick={(e) => {
                  setIsDeleting(true)
                  e.stopPropagation()
                  void sdkClient[sdkResource]
                    .delete(resource.id)
                    .then(() => {
                      void mutatePrice()
                      close()
                    })
                    .catch(() => {})
                    .finally(() => {
                      setIsDeleting(false)
                    })
                }}
              >
                Delete price {type} tier
              </Button>
            </PageLayout>
          </Overlay>
        )}
      </>
    )
  }
)
