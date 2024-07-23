import type { Promotion } from '#types'
import {
  HookedInput,
  HookedInputSelect,
  Spacer,
  Text,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk'
import { useFormContext } from 'react-hook-form'
import { InputCurrencyComponent } from './components/InputCurrencyComponent'
import { SelectCurrencyComponent } from './components/SelectCurrencyComponent'
import { SelectMarketComponent } from './components/SelectMarketComponent'
import { SelectSkuListComponent } from './components/SelectSkuListComponent'
import { SelectTagComponent } from './components/SelectTagComponent'
import type { Rule } from './usePromotionRules'

export const matchers = {
  in: {
    label: 'is',
    value: 'in'
  },
  not_in: {
    label: 'is not',
    value: 'not_in'
  },
  eq: {
    label: 'is equal to',
    value: 'eq'
  },
  gteq: {
    label: 'is equal or greater than',
    value: 'gteq'
  },
  gt: {
    label: 'is greater than',
    value: 'gt'
  },
  lteq: {
    label: 'is equal or lower than',
    value: 'lteq'
  },
  lt: {
    label: 'is lower than',
    value: 'lt'
  },
  end_any: {
    label: 'ends with',
    value: 'end_any'
  }
} as const satisfies {
  [key in 'in' | 'not_in' | 'eq' | 'gteq' | 'gt' | 'lteq' | 'lt' | 'end_any']: {
    label: string
    value: key
  }
}

export const ruleBuilderConfig: RuleBuilderConfig = {
  market_id: {
    resource: 'custom_promotion_rules',
    rel: 'markets',
    label: 'Market',
    operators: [matchers.in, matchers.not_in],
    Component: ({ promotion }) => (
      <SelectMarketComponent promotion={promotion} />
    ),
    isAvailable() {
      return true
    }
  },
  currency_code: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Currency',
    operators: [matchers.in, matchers.not_in],
    Component: ({ promotion }) => (
      <SelectCurrencyComponent promotion={promotion} />
    ),
    isAvailable() {
      return true
    }
  },
  skuListPromotionRule: {
    resource: 'sku_list_promotion_rules',
    rel: 'sku_lists',
    label: 'SKU list',
    operators: null,
    Component: () => {
      const { watch } = useFormContext()
      const watchedAllSKUs = watch('all_skus')
      return (
        <>
          <SelectSkuListComponent />
          <Spacer top='4'>
            <HookedInputSelect
              name='all_skus'
              initialValues={[
                { label: 'Active for any SKU in the SKU list', value: 'any' },
                { label: 'Active for all SKUs in the SKU list', value: 'all' },
                { label: 'Active for at least', value: 'number' }
              ]}
            />
            {watchedAllSKUs === 'number' && (
              <Spacer top='4'>
                <HookedInput
                  type='number'
                  min={0}
                  name='min_quantity'
                  suffix={<Text variant='info'>SKUs in the SKU list</Text>}
                />
              </Spacer>
            )}
          </Spacer>
        </>
      )
    },
    isAvailable() {
      return true
    }
  },
  line_items_sku_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'SKU tag',
    operators: [matchers.in, matchers.not_in],
    Component: () => <SelectTagComponent />,
    isAvailable() {
      return true
    }
  },
  customer_status: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Customer status',
    operators: [matchers.in, matchers.not_in],
    Component: () => (
      <HookedInputSelect
        name='value'
        placeholder='Select...'
        initialValues={[
          { label: 'Prospect', value: 'prospect' },
          {
            label: 'Acquired',
            value: 'acquired'
          },
          { label: 'Repeat', value: 'repeat' }
        ]}
        isMulti
      />
    ),
    isAvailable() {
      return true
    }
  },
  customer_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'Customer tag',
    operators: [matchers.in, matchers.not_in],
    Component: () => <SelectTagComponent />,
    isAvailable() {
      return true
    }
  },
  customer_email: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Customer email',
    operators: [matchers.end_any],
    Component: () => <HookedInput name='value' />,
    isAvailable() {
      return true
    }
  },
  customer_customer_subscriptions_reference: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Customer subscription',
    operators: [matchers.in, matchers.not_in],
    Component: () => <HookedInput name='value' />,
    isAvailable() {
      return true
    }
  },
  tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'Order tag',
    operators: [matchers.in, matchers.not_in],
    Component: () => <SelectTagComponent />,
    isAvailable() {
      return true
    }
  },
  subtotal_amount_cents: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Cart subtotal',
    operators: [
      matchers.eq,
      matchers.gteq,
      matchers.gt,
      matchers.lteq,
      matchers.lt
    ],
    Component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isAvailable({ currencyCodes }) {
      return currencyCodes.length === 1
    }
  },
  total_amount_cents: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Cart total',
    operators: [
      matchers.eq,
      matchers.gteq,
      matchers.gt,
      matchers.lteq,
      matchers.lt
    ],
    Component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isAvailable({ currencyCodes }) {
      return currencyCodes.length === 1
    }
  }
}

export type RuleBuilderConfig = Record<
  | 'market_id'
  | 'currency_code'
  | 'total_amount_cents'
  | 'line_items_sku_tags_id'
  | 'customer_status'
  | 'customer_tags_id'
  | 'customer_email'
  | 'customer_customer_subscriptions_reference'
  | 'tags_id'
  | 'subtotal_amount_cents'
  | 'skuListPromotionRule',
  {
    resource: 'custom_promotion_rules' | 'sku_list_promotion_rules'
    rel: Extract<ListableResourceType, 'markets' | 'tags' | 'sku_lists'> | null
    label: string
    operators: Array<(typeof matchers)[keyof typeof matchers]> | null
    Component: (props: { promotion: Promotion }) => React.ReactNode
    isAvailable: (config: {
      rules: Rule[]
      currencyCodes: CurrencyCode[]
    }) => boolean
  }
>
