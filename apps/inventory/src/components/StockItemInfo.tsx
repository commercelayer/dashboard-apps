import { makeStockItem } from '#mocks'
import { ListDetailsItem, Section, Text } from '@commercelayer/app-elements'
import type { StockItem } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  stockItem: StockItem
}

export const StockItemInfo: FC<Props> = ({ stockItem = makeStockItem() }) => {
  return (
    <Section title='Info'>
      <ListDetailsItem label='Stock Location' gutter='none'>
        <Text tag='div' weight='semibold'>
          {stockItem.stock_location?.name}
        </Text>
      </ListDetailsItem>
      <ListDetailsItem label='Quantity' gutter='none'>
        <Text tag='div' weight='semibold'>
          {stockItem.quantity}
        </Text>
      </ListDetailsItem>
      {stockItem.reserved_stock?.quantity != null && (
        <ListDetailsItem label='Reserved quantity' gutter='none'>
          <Text tag='div' weight='semibold'>
            {stockItem.reserved_stock?.quantity}
          </Text>
        </ListDetailsItem>
      )}
    </Section>
  )
}
