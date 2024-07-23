import {
  HookedInputCurrency,
  HookedInputSelect,
  ListItem,
  Spacer,
  currencies,
  formatCentsToCurrency,
  type CurrencyCode
} from '@commercelayer/app-elements'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  fixed_amount_promotions: {
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'currencyEur',
    titleList: 'Fixed amount discount',
    description: 'Apply a fixed amount discount to the orders.',
    titleNew: 'fixed amount discount',
    formType: genericPromotionOptions.merge(
      z.object({
        sku_list: z.string().nullish(),
        fixed_amount_cents: z
          .string()
          .or(z.number())
          .transform((p) => parseInt(p.toString())),
        currency_code: z.string()
      })
    ),
    Fields: ({ promotion }) => {
      const { watch } = useFormContext()
      const watchedCurrencyCode = watch('currency_code')

      const currencyCode: CurrencyCode =
        watchedCurrencyCode ??
        (promotion?.currency_code as CurrencyCode) ??
        'USD'

      return (
        <>
          <Spacer top='6'>
            <ListItem padding='none' borderStyle='none' alignItems='top'>
              <HookedInputCurrency
                name='fixed_amount_cents'
                currencyCode={currencyCode}
                label='Fixed amount discount *'
                hint={{
                  text: 'How much the order is discounted.'
                }}
              />
              <HookedInputSelect
                name='currency_code'
                label='&nbsp;'
                placeholder=''
                initialValues={Object.entries(currencies).map(([code]) => ({
                  label: code.toUpperCase(),
                  value: code.toUpperCase()
                }))}
              />
            </ListItem>
          </Spacer>
        </>
      )
    },
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
    StatusDescription: ({ promotion }) => (
      <>
        {formatCentsToCurrency(
          promotion.fixed_amount_cents,
          promotion.currency_code as CurrencyCode
        )}
      </>
    ),
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'fixed_amount_promotions'>
