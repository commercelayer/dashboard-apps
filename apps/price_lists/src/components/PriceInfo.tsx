import { makePrice } from '#mocks'
import { ListDetailsItem, Section, Text } from '@commercelayer/app-elements'
import type { Price } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  price: Price
}

export const PriceInfo: FC<Props> = ({ price = makePrice() }) => {
  return (
    <Section title='Info'>
      <ListDetailsItem label='Price' gutter='none'>
        <Text tag='div' weight='semibold'>
          {price.formatted_amount}
        </Text>
      </ListDetailsItem>
      {price.formatted_amount !== price.formatted_compare_at_amount &&
        price.formatted_compare_at_amount != null && (
          <ListDetailsItem label='Original price' gutter='none'>
            <Text tag='div' weight='semibold' variant='info'>
              <s>{price.formatted_compare_at_amount}</s>
            </Text>
          </ListDetailsItem>
        )}
    </Section>
  )
}
