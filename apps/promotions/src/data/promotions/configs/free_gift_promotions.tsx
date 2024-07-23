import {
  A,
  HookedInput,
  ListDetailsItem,
  Spacer
} from '@commercelayer/app-elements'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  free_gift_promotions: {
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'gift',
    titleList: 'Free gift',
    description:
      'Set the price to zero for products belonging to a specific list.',
    titleNew: 'free gift promotion',
    formType: genericPromotionOptions.merge(
      z.object({
        sku_list: z.string(),
        max_quantity: z
          .number()
          .min(1)
          .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$/))
          .transform((p) =>
            p != null && p !== '' ? parseInt(p.toString()) : undefined
          )
      })
    ),
    Fields: ({ promotion }) => {
      return (
        <>
          <Spacer top='6'>
            <PromotionSkuListSelector
              promotion={promotion}
              label='Free gift products *'
              hint='Apply the promotion to any SKUs within this list.'
            />
          </Spacer>
          <Spacer top='6'>
            <HookedInput
              type='number'
              min={1}
              name='max_quantity'
              label='Max free quantity'
              hint={{
                text: (
                  <>
                    The most you can get for free.{' '}
                    <A href='https://docs.commercelayer.io/core/v/api-reference/free_gift_promotions'>
                      Learn more
                    </A>
                  </>
                )
              }}
            />
          </Spacer>
        </>
      )
    },
    Options: () => <></>,
    StatusDescription: () => <>Free gift</>,
    DetailsSectionInfo: ({ promotion }) => (
      <>
        <ListDetailsItem label='Max free quantity' gutter='none'>
          {promotion.max_quantity}
        </ListDetailsItem>
      </>
    )
  }
} satisfies Pick<PromotionConfig, 'free_gift_promotions'>
