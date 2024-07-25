import { makeSku } from '#mocks'
import {
  ListDetailsItem,
  Section,
  Text,
  getUnitOfWeightName
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  sku: Sku
}

export const SkuInfo: FC<Props> = ({ sku = makeSku() }) => {
  return (
    <Section title='Info'>
      {sku.shipping_category != null && (
        <ListDetailsItem
          label='Shipping category'
          childrenAlign='right'
          gutter='none'
        >
          <Text tag='div' weight='semibold'>
            {sku.shipping_category?.name}
          </Text>
        </ListDetailsItem>
      )}
      {sku.weight != null && sku.weight > 0 ? (
        <ListDetailsItem label='Weight' childrenAlign='right' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.weight}{' '}
            {sku.unit_of_weight != null
              ? getUnitOfWeightName(sku.unit_of_weight).toLowerCase()
              : ''}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.do_not_ship != null && sku.do_not_ship ? (
        <ListDetailsItem label='Shipping' childrenAlign='right' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.do_not_ship ? 'Do not ship' : ''}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.do_not_track != null && sku.do_not_track ? (
        <ListDetailsItem label='Tracking' childrenAlign='right' gutter='none'>
          <Text tag='div' weight='semibold'>
            {sku.do_not_track ? 'Do not track stock' : ''}
          </Text>
        </ListDetailsItem>
      ) : null}
      {sku.pieces_per_pack != null && sku.pieces_per_pack > 0 ? (
        <ListDetailsItem
          label='Pieces per pack'
          childrenAlign='right'
          gutter='none'
        >
          <Text tag='div' weight='semibold'>
            {sku.pieces_per_pack} {sku.pieces_per_pack > 1 ? 'pieces' : 'piece'}
          </Text>
        </ListDetailsItem>
      ) : null}
    </Section>
  )
}
