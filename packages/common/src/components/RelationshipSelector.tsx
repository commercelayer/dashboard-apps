import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectProps,
  type InputSelectValue
} from '@commercelayer/app-elements'
import {
  type CommerceLayerClient,
  type ListableResourceType,
  type ListResponse,
  type QueryFilter
} from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import { type FC } from 'react'

type ListResource<TResource extends ListableResourceType> = Awaited<
  ReturnType<CommerceLayerClient[TResource]['list']>
>
type Resource<TResource extends ListableResourceType> =
  ListResource<TResource>[number]

function makeSelectInitialValuesWithDefault<
  R extends Resource<ListableResourceType>
>({
  resourceList,
  defaultResource,
  emptyValueLabel
}: {
  resourceList?: ListResponse<R>
  defaultResource?: R
  emptyValueLabel?: string
}): InputSelectValue[] {
  const options = [
    defaultResource != null
      ? {
          label:
            'name' in defaultResource && defaultResource.name != null
              ? defaultResource.name
              : defaultResource.id,
          value: defaultResource.id
        }
      : undefined,
    ...(resourceList ?? []).map((item) => ({
      label: 'name' in item && item.name != null ? item.name : item.id,
      value: item.id,
      meta: item
    }))
  ].filter((v) => !isEmpty(v)) as InputSelectValue[]

  const sortedOptions = options.sort((a, b) => a.label.localeCompare(b.label))

  return (
    emptyValueLabel != null
      ? [
          {
            label: emptyValueLabel,
            value: ''
          }
        ]
      : ([] as InputSelectValue[])
  ).concat(sortedOptions)
}

interface RelationshipSelectorProps
  extends Pick<InputSelectProps, 'label' | 'hint' | 'isClearable'> {
  /** The field name to use in the form state */
  fieldName: string
  /** The resource type to fetch */
  resourceType: ListableResourceType
  /**
   * In case of edit, the default resource id.
   * It needs to be fetched separately to appear as option when it's not in the first page
   */
  defaultResourceId?: string
  /** Label for the empty (first) option. Eg: Please select a market */
  emptyValueLabel?: string
  /** Additional filters to apply to the list query */
  filters?: QueryFilter
}

export const RelationshipSelector: FC<RelationshipSelectorProps> = ({
  defaultResourceId,
  resourceType,
  fieldName,
  label,
  hint,
  isClearable,
  emptyValueLabel,
  filters
}) => {
  const { sdkClient } = useCoreSdkProvider()

  const { data, isLoading: isLoadingInitialValues } = useCoreApi(
    resourceType,
    'list',
    [
      {
        fields: ['name'],
        filters:
          defaultResourceId == null
            ? filters
            : {
                ...filters,
                id_not_eq: defaultResourceId
              },
        pageSize: 25,
        sort: {
          name: 'asc'
        }
      }
    ]
  )

  const { data: defaultResource, isLoading: isLoadingDefaultResource } =
    useCoreApi(
      resourceType,
      'retrieve',
      isEmpty(defaultResourceId) || defaultResourceId == null
        ? null
        : [
            defaultResourceId,
            {
              fields: ['name']
            }
          ]
    )

  const hasMorePages =
    (data?.meta?.pageCount != null && data.meta.pageCount > 1) ?? false

  const initialValues = makeSelectInitialValuesWithDefault<
    Resource<typeof resourceType>
  >({
    resourceList: data,
    defaultResource,
    emptyValueLabel
  })

  return (
    <HookedInputSelect
      name={fieldName}
      label={label}
      hint={hint}
      isLoading={isLoadingInitialValues || isLoadingDefaultResource}
      initialValues={initialValues}
      isSearchable
      isClearable={emptyValueLabel == null ? isClearable : false}
      menuFooterText={
        hasMorePages
          ? 'Showing 25 results. Type to search for more options.'
          : undefined
      }
      loadAsyncValues={
        hasMorePages
          ? async (hint) => {
              return await sdkClient[resourceType]
                .list({
                  pageSize: 25,
                  filters: {
                    name_cont: hint
                  }
                })
                .then((res) => {
                  return res.map((item) => ({
                    label:
                      'name' in item && item.name != null ? item.name : item.id,
                    value: item.id,
                    meta: item
                  }))
                })
            }
          : undefined
      }
    />
  )
}
