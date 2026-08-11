import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  isMock,
  Td,
  Tr,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type {
  Price,
  PriceFrequencyTier,
  PriceVolumeTier,
} from "@commercelayer/sdk"
import type { KeyedMutator } from "swr"
import { useLocation, useRoute } from "wouter"
import { appRoutes } from "#data/routes"
import { makePriceTier } from "#mocks"
import type { PriceTierType } from "#types"
import { getPriceTierSdkResource, getUpToForTable } from "#utils/priceTiers"

interface Props {
  type: PriceTierType
  resource: PriceFrequencyTier | PriceVolumeTier
  mutatePrice: KeyedMutator<Price>
}

export const TableItemPriceTier = withSkeletonTemplate<Props>(
  ({ type, resource = makePriceTier(type), mutatePrice }) => {
    const [, params] = useRoute<{ priceId: string }>(
      appRoutes.priceDetails.path,
    )
    const priceId = params?.priceId ?? ""

    const [, setLocation] = useLocation()
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()

    const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

    const sdkResource = getPriceTierSdkResource(type)
    const appRoutesPath =
      type === "frequency" ? "priceFrequencyTierEdit" : "priceVolumeTierEdit"

    const contextMenuEdit = canUser("update", sdkResource) &&
      !isMock(resource) && (
        <DropdownItem
          label="Edit"
          onClick={() => {
            setLocation(
              appRoutes[appRoutesPath].makePath({
                priceId,
                tierId: resource.id,
              }),
            )
          }}
        />
      )

    const contextMenuDivider = canUser("update", sdkResource) &&
      canUser("destroy", sdkResource) && <DropdownDivider />

    const contextMenuDelete = canUser("destroy", sdkResource) && (
      <DropdownItem
        label="Delete"
        onClick={() => {
          showDeleteDialog()
        }}
      />
    )

    const contextMenu = (
      <Dropdown
        dropdownLabel={<Icon name="dotsThree" size={24} />}
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
          <Td align="right">{contextMenu}</Td>
        </Tr>
        {canUser("destroy", sdkResource) && (
          <ConfirmDialog
            icon="trash"
            title={`Delete price ${type} tier ${resource.name}`}
            description="This action cannot be undone."
            confirm={{
              label: `Delete price ${type} tier`,
              variant: "danger",
              onClick: async () => {
                await sdkClient[sdkResource].delete(resource.id)
                await mutatePrice()
              },
            }}
          />
        )}
      </>
    )
  },
)
