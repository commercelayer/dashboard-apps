import {
  currencyInputSelectOptions,
  flatSelectValues,
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import {
  type ListResponse,
  type Market,
  type Resource
} from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import { type FC } from 'react'
import { useFormContext } from 'react-hook-form'

/**
 * Render a select input to choose a market as relationship with an empty option to choose "All markets with currency".
 * If this option is selected, a currency select input will be shown.
 * Form field names are `market` and `currency_code`, so use them in the form schema when using this component.
 */
export const MarketWithCurrencySelector: FC<{
  defaultMarketId: string
  defaultCurrencyCode: string
  hint: string
}> = ({ defaultMarketId, defaultCurrencyCode, hint }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { watch, setValue } = useFormContext()
  const { data, isLoading: isLoadingInitialValues } = useCoreApi(
    'markets',
    'list',
    [
      {
        fields: {
          markets: ['name', 'price_list'],
          price_lists: ['currency_code']
        },
        include: ['price_list'],
        pageSize: 25,
        filters: {
          id_not_eq: defaultMarketId
        },
        sort: {
          name: 'asc'
        }
      }
    ]
  )

  const hasMorePages =
    (data?.meta?.pageCount != null && data.meta.pageCount > 1) ?? false

  const { data: defaultResource, isLoading: isLoadingDefaultResource } =
    useCoreApi(
      'markets',
      'retrieve',
      isEmpty(defaultMarketId)
        ? null
        : [
            defaultMarketId,
            {
              fields: {
                markets: ['name', 'price_list'],
                price_lists: ['currency_code']
              },
              include: ['price_list']
            }
          ]
    )

  const initialValues = [
    {
      label: 'All markets with currency',
      value: ''
    },
    ...makeSelectInitialValuesWithDefault<Market>({
      resourceList: data,
      defaultResource,
      fieldForLabel: 'name'
    })
  ]

  const selectedMarket = watch('market')

  return (
    <div className='flex gap-4'>
      <div className='flex-1'>
        <HookedInputSelect
          name='market'
          label='Market'
          hint={{
            text: hint
          }}
          isLoading={isLoadingInitialValues || isLoadingDefaultResource}
          isClearable={false}
          isSearchable
          initialValues={initialValues}
          onSelect={(selected) => {
            const relatedCurrencyCode = flatSelectValues(
              selected,
              'meta.price_list.currency_code'
            )
            if (
              isString(relatedCurrencyCode) &&
              !isEmpty(relatedCurrencyCode)
            ) {
              setValue(
                'currency_code',
                relatedCurrencyCode ?? defaultCurrencyCode
              )
            }
          }}
          menuFooterText={
            hasMorePages
              ? 'Showing 25 results. Type to search for more options.'
              : undefined
          }
          loadAsyncValues={
            hasMorePages
              ? async (hint) => {
                  return await sdkClient.markets
                    .list({
                      pageSize: 25,
                      filters: {
                        name_cont: hint,
                        fields: {
                          markets: ['name', 'price_list'],
                          price_lists: ['currency_code']
                        },
                        include: ['price_list']
                      }
                    })
                    .then((res) => {
                      return res.map((market) => ({
                        label: market.name,
                        value: market.id,
                        meta: market
                      }))
                    })
                }
              : undefined
          }
        />
      </div>
      {isEmpty(selectedMarket) && (
        <HookedInputSelect
          name='currency_code'
          label='&nbsp;'
          initialValues={currencyInputSelectOptions}
        />
      )}
    </div>
  )
}

function makeSelectInitialValuesWithDefault<R extends Resource>({
  resourceList,
  defaultResource,
  fieldForLabel
}: {
  resourceList?: ListResponse<R>
  defaultResource?: R
  fieldForLabel: keyof R
}): InputSelectValue[] {
  const options = [
    defaultResource != null
      ? {
          label: (
            defaultResource[fieldForLabel] ?? defaultResource.id
          ).toString(),
          value: defaultResource.id
        }
      : undefined,
    ...(resourceList ?? []).map((item) => ({
      label: (item[fieldForLabel] ?? item.id).toString(),
      value: item.id,
      meta: item
    }))
  ].filter((v) => !isEmpty(v)) as InputSelectValue[]

  return options.sort((a, b) => a.label.localeCompare(b.label))
}
