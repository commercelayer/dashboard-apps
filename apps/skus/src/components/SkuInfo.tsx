import { makeSku } from '#mocks'
import {
  ListDetailsItem,
  Section,
  Text,
  getUnitOfWeightName
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import type { FC } from 'react'

interface Props {
  sku: Sku
}

export const SkuInfo: FC<Props> = ({ sku = makeSku() }) => {
  const unitOfWeight =
    !isEmpty(sku.unit_of_weight) && sku.unit_of_weight != null
      ? getUnitOfWeightName(sku.unit_of_weight)
      : ''

  return (
    <Section title='Info'>
      {sku.shipping_category != null && (
        <ListDetailsItem label='Shipping category' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.shipping_category?.name}
          </Text>
        </ListDetailsItem>
      )}
      {sku.weight != null && sku.weight > 0 ? (
        <ListDetailsItem label='Weight' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.weight} {unitOfWeight.toLowerCase()}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.do_not_ship != null && sku.do_not_ship ? (
        <ListDetailsItem label='Shipping' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.do_not_ship ? 'Do not ship' : ''}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.do_not_track != null && sku.do_not_track ? (
        <ListDetailsItem label='Tracking' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.do_not_track ? 'Do not track stock' : ''}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.pieces_per_pack != null && sku.pieces_per_pack > 0 ? (
        <ListDetailsItem label='Pieces per pack' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.pieces_per_pack} {sku.pieces_per_pack > 1 ? 'pieces' : 'piece'}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.hs_tariff_number != null ? (
        <ListDetailsItem label='HS Code' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.hs_tariff_number}
          </Text>
        </ListDetailsItem>
      ) : null}
    </Section>
  )
}
