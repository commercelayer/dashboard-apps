import {
  HookedInput,
  ListDetailsItem,
  Spacer
} from '@commercelayer/app-elements'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  external_promotions: {
    type: 'external_promotions',
    slug: 'external',
    icon: 'linkSimple',
    titleList: 'External promotion',
    description:
      'Integrate any kind of promotional engine as an external promotion.',
    titleNew: 'external promotion',
    formType: genericPromotionOptions.merge(
      z.object({
        promotion_url: z.string().url(),
        sku_list: z.string().nullish()
      })
    ),
    Fields: () => (
      <>
        <Spacer top='6'>
          <HookedInput
            name='promotion_url'
            label='External service URL *'
            hint={{
              text: (
                <>
                  Insert your service endpoint and follow the{' '}
                  <a href='https://docs.commercelayer.io/core/external-resources/external-promotions'>
                    external promotions guide
                  </a>{' '}
                  for setup.
                </>
              )
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
    StatusDescription: () => <>External</>,
    DetailsSectionInfo: ({ promotion }) => (
      <>
        <ListDetailsItem label='External service URL' gutter='none'>
          {promotion.promotion_url}
        </ListDetailsItem>
      </>
    )
  }
} satisfies Pick<PromotionConfig, 'external_promotions'>
