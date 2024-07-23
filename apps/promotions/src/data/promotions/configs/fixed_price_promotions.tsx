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
  fixed_price_promotions: {
    type: 'fixed_price_promotions',
    slug: 'fixed-price',
    icon: 'pushPin',
    titleList: 'Fixed price',
    description:
      'Impose a fixed price for products belonging to a specific list.',
    titleNew: 'fixed price promotion',
    formType: genericPromotionOptions.merge(
      z.object({
        sku_list: z.string(),
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
            <PromotionSkuListSelector
              promotion={promotion}
              label='Promoted products *'
              hint='Impose a fixed price to any SKUs within this list.'
            />
          </Spacer>
          <Spacer top='6'>
            <ListItem padding='none' borderStyle='none' alignItems='top'>
              <HookedInputCurrency
                name='fixed_amount_cents'
                currencyCode={currencyCode}
                label='Fixed price *'
                hint={{
                  text: 'The price of the SKUs in the list.'
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
    Options: () => <></>,
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
} satisfies Pick<PromotionConfig, 'fixed_price_promotions'>
