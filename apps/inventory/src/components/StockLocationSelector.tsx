import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { ListResponse, Resource, StockLocation } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import isString from 'lodash-es/isString'
import { type FC } from 'react'
import { useFormContext } from 'react-hook-form'

export const StockLocationSelector: FC = () => {
  const { sdkClient } = useCoreSdkProvider()
  const { setValue } = useFormContext()
  const { data, isLoading: isLoadingInitialValues } = useCoreApi(
    'stock_locations',
    'list',
    [
      {
        fields: {
          stock_locations: ['name']
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
    ...makeSelectInitialValuesWithDefault<StockLocation>({
      resourceList: data,
      fieldForLabel: 'name'
    })
  ]

  return (
    <HookedInputSelect
      name='stockLocation'
      label='Stock location'
      placeholder='Select a stock location'
      initialValues={initialValues}
      isLoading={isLoadingInitialValues}
      isClearable={false}
      isSearchable
      onSelect={(selected) => {
        if (isString(selected) && !isEmpty(selected)) {
          setValue('stockLocation', selected)
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
              return await sdkClient.stock_locations
                .list({
                  pageSize: 25,
                  filters: {
                    name_cont: hint,
                    fields: {
                      stock_locations: ['name']
                    }
                  }
                })
                .then((res) => {
                  return res.map((stockLocation) => ({
                    label: stockLocation.name,
                    value: stockLocation.id
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
