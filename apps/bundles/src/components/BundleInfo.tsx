import { makeBundle } from '#mocks'
import { ListDetailsItem, Section, Text } from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  bundle: Bundle
}

export const BundleInfo: FC<Props> = ({ bundle = makeBundle() }) => {
  return (
    <Section title='Info'>
      {bundle.market != null && (
        <ListDetailsItem label='Market' gutter='none'>
          <Text tag='div'>{bundle.market?.name}</Text>
        </ListDetailsItem>
      )}
      <ListDetailsItem label='Price' gutter='none'>
        <Text tag='div'>{bundle.formatted_price_amount}</Text>
      </ListDetailsItem>
      {bundle.formatted_price_amount !== bundle.formatted_compare_at_amount &&
        bundle.formatted_compare_at_amount != null && (
          <ListDetailsItem label='Original price' gutter='none'>
            <Text tag='div' variant='info'>
              <s>{bundle.formatted_compare_at_amount}</s>
            </Text>
          </ListDetailsItem>
        )}
    </Section>
  )
}
