import {
  ResourceAddress,
  Section,
  Stack,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

interface Props {
  stockTransfer: StockTransfer
}

export const StockTransferAddresses = withSkeletonTemplate<Props>(
  ({ stockTransfer }): React.JSX.Element | null => {
    if (
      stockTransfer.origin_stock_location?.address == null ||
      stockTransfer.destination_stock_location?.address == null
    ) {
      return null
    }

    return (
      <>
        <Section title='Addresses' border='none'>
          <Stack>
            <ResourceAddress
              address={stockTransfer.origin_stock_location?.address}
              title='Origin'
            />
            <ResourceAddress
              address={stockTransfer.destination_stock_location?.address}
              title='Destination'
            />
          </Stack>
        </Section>
      </>
    )
  }
)
