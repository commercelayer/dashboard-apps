import { makeBundle } from '#mocks'
import {
  formatDate,
  ListDetailsItem,
  Section,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  bundle: Bundle
}

export const BundleInfo: FC<Props> = ({ bundle = makeBundle() }) => {
  const { user } = useTokenProvider()

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
      <ListDetailsItem label='Created' gutter='none'>
        <Text tag='div'>
          {formatDate({
            isoDate: bundle.created_at,
            timezone: user?.timezone,
            format: 'full'
          })}
        </Text>
      </ListDetailsItem>
      <ListDetailsItem label='Updated' gutter='none'>
        <Text tag='div'>
          {formatDate({
            isoDate: bundle.updated_at,
            timezone: user?.timezone,
            format: 'full'
          })}
        </Text>
      </ListDetailsItem>
    </Section>
  )
}
