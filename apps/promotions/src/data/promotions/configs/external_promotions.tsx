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
        external_includes: z
          .string()
          .nullish()
          .refine(
            (value) => {
              if (value == null || value.trim() === '') {
                return true
              }
              return parseIncludes(value).every(isValidResourceName)
            },
            {
              message:
                'Please provide a comma-separated list of valid resource names.'
            }
          ),
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
        <Spacer top='6'>
          <HookedInput
            name='external_includes'
            label='External includes'
            hint={{
              text: (
                <>
                  Comma-separated resource names for the request payload. Leave
                  empty for defaults.{' '}
                  <a
                    href='https://docs.commercelayer.io/core/external-resources#custom-include-list'
                    target='_blank'
                    rel='noreferrer'
                  >
                    Learn more
                  </a>
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
        {promotion.external_includes != null && (
          <ListDetailsItem label='Includes' gutter='none'>
            <div>
              {promotion.external_includes
                .map((item) => item.trim())
                .join(', ')}
            </div>
          </ListDetailsItem>
        )}
      </>
    )
  }
} satisfies Pick<PromotionConfig, 'external_promotions'>

export function parseIncludes(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  ]
}

/**
 * Valid resource names may contain lowercase letters, underscores, and dots only.
 * Examples:
 * - valid: `orders`, `shipments_items`, `customer.addresses`
 * - invalid: `Order`, `line-items`, `sku list`, `items/sku`
 */
export function isValidResourceName(item: string): boolean {
  return /^[a-z_.]+$/.test(item)
}
