import {
  formatNumber,
  ListDetailsItem,
  Section,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { StockItem } from "@commercelayer/sdk"
import type { FC } from "react"
import { makeStockItem } from "#mocks"

interface Props {
  stockItem: StockItem
}

export const StockItemInfo: FC<Props> = ({ stockItem = makeStockItem() }) => {
  const { user } = useTokenProvider()

  return (
    <Section title="Info">
      <ListDetailsItem label="Stock location" gutter="none">
        <Text tag="div" weight="semibold">
          {stockItem.stock_location?.name}
        </Text>
      </ListDetailsItem>
      <ListDetailsItem label="Quantity" gutter="none">
        <Text tag="div" weight="semibold">
          {formatNumber({ value: stockItem.quantity, locale: user?.locale })}
        </Text>
      </ListDetailsItem>
      {stockItem.low_quantity != null && (
        <ListDetailsItem label="Low stock threshold" gutter="none">
          <Text tag="div" weight="semibold">
            {formatNumber({
              value: stockItem.low_quantity,
              locale: user?.locale,
            })}
          </Text>
        </ListDetailsItem>
      )}
      {stockItem.reserved_stock?.quantity != null && (
        <ListDetailsItem label="Reserved quantity" gutter="none">
          <Text tag="div" weight="semibold">
            {formatNumber({
              value: stockItem.reserved_stock.quantity,
              locale: user?.locale,
            })}
          </Text>
        </ListDetailsItem>
      )}
    </Section>
  )
}
