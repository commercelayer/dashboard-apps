import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { ListResponse, PriceList, Resource } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import isString from 'lodash-es/isString'
import { type FC } from 'react'
import { useFormContext } from 'react-hook-form'

export const PriceListSelector: FC = () => {
  const { sdkClient } = useCoreSdkProvider()
  const { setValue } = useFormContext()
  const { data, isLoading: isLoadingInitialValues } = useCoreApi(
    'price_lists',
    'list',
    [
      {
        fields: {
          price_lists: ['name', 'currency_code']
        },
        pageSize: 25,
        sort: {
          name: 'asc'
        }
      }
    ]
  )

  const hasMorePages =
    (data?.meta?.pageCount != null && data.meta.pageCount > 1) ?? false

  const initialValues = [
    ...makeSelectInitialValuesWithDefault<PriceList>({
      resourceList: data,
      fieldForLabel: 'name'
    })
  ]

  return (
    <HookedInputSelect
      name='price_list'
      label='Price list'
      placeholder='Select a price list'
      initialValues={initialValues}
      isLoading={isLoadingInitialValues}
      isClearable={false}
      isSearchable
      onSelect={(selected) => {
        if (isString(selected) && !isEmpty(selected)) {
          setValue('price_list', selected)
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
              return await sdkClient.price_lists
                .list({
                  pageSize: 25,
                  filters: {
                    name_cont: hint,
                    fields: {
                      price_lists: ['name']
                    }
                  }
                })
                .then((res) => {
                  return res.map((priceList) => ({
                    label: priceList.name,
                    value: priceList.id,
                    meta: priceList
                  }))
                })
            }
          : undefined
      }
    />
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
