import { HookedInput, Spacer } from '@commercelayer/app-elements'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  percentage_discount_promotions: {
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'percent',
    titleList: 'Percentage discount',
    description:
      'Apply a specific percentage discount to the subtotal amount of orders.',
    titleNew: 'percentage discount',
    formType: genericPromotionOptions.merge(
      z.object({
        percentage: z
          .string()
          .refine(
            (value) => /^[1-9][0-9]?$|^100$/.test(value),
            'Enter a valid number between 1 and 100'
          )
          .or(z.number().min(1).max(100))
          .transform((p) => parseInt(p.toString())),
        sku_list: z.string().nullish()
      })
    ),
    Fields: () => (
      <>
        <Spacer top='6'>
          <HookedInput
            type='number'
            min={1}
            max={100}
            name='percentage'
            label='Percentage discount *'
            suffix='%'
            hint={{
              text: 'How much the order is discounted in percentage.'
            }}
          />
        </Spacer>
      </>
    ),
    Options: ({ promotion }) => {
      return (
        <>
          <PromotionSkuListSelector
            optional
            promotion={promotion}
            hint='Apply the promotion only to the SKUs within the selected SKU list.'
          />
        </>
      )
    },
    StatusDescription: ({ promotion }) => <>{promotion.percentage}%</>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'percentage_discount_promotions'>
