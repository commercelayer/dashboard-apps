import type { Promotion } from '#types'
import {
  HookedInputRadioGroup,
  HookedInputSelect,
  Section,
  Spacer,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type {
  FlexPromotion,
  QueryParamsList,
  SkuList
} from '@commercelayer/sdk'

export const PromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Promotion
  optional?: boolean
  placeholder?: string
}> = ({ hint, label, promotion, placeholder, optional = false }) => {
  const fieldName = 'sku_list'

  if (promotion?.type === 'flex_promotions') {
    return null
  }

  if (!optional) {
    return (
      <HookedInternalPromotionSkuListSelector
        name={fieldName}
        label={label}
        hint={hint}
        promotion={promotion}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Spacer top='14'>
      <Section title='Apply the discount to'>
        <Spacer top='6'>
          <Spacer top='2'>
            <HookedInputRadioGroup
              name='apply_the_discount_to'
              viewMode='simple'
              options={[
                {
                  value: 'all',
                  content: 'All products in the order'
                },
                {
                  value: 'sku_list',
                  content: 'Selected products',
                  checkedElement: (
                    <Spacer bottom='6'>
                      <HookedInternalPromotionSkuListSelector
                        name={fieldName}
                        promotion={promotion}
                        hint={hint}
                        placeholder={placeholder}
                      />
                    </Spacer>
                  )
                }
              ]}
            />
          </Spacer>
        </Spacer>
      </Section>
    </Spacer>
  )
}

const HookedInternalPromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Exclude<Promotion, FlexPromotion>
  placeholder?: string
  name: string
}> = ({ hint, label, promotion, name, placeholder = 'Search...' }) => {
  const { sdkClient } = useCoreSdkProvider()

  const { data: skuLists = [] } = useCoreApi('sku_lists', 'list', [
    getParams({ name: '' })
  ])

  return (
    <HookedInputSelect
      name={name}
      label={label}
      isClearable
      hint={{
        text: hint
      }}
      placeholder={placeholder}
      initialValues={
        promotion?.sku_list != null
          ? [
              {
                label: promotion.sku_list.name,
                value: promotion.sku_list.id
              }
            ]
          : toInputSelectValues(skuLists)
      }
      loadAsyncValues={async (name) => {
        const skuLists = await sdkClient.sku_lists.list({
          pageSize: 25,
          filters: {
            name_cont: name
          }
        })

        return skuLists.map(({ name, id }) => ({
          label: name,
          value: id
        }))
      }}
    />
  )
}

HookedInternalPromotionSkuListSelector.displayName =
  'HookedInternalPromotionSkuListSelector'

function getParams({ name }: { name: string }): QueryParamsList<SkuList> {
  return {
    pageSize: 25,
    sort: {
      name: 'asc'
    },
    filters: {
      name_cont: name
    }
  }
}

function toInputSelectValues(
  items: Array<{ name: string; id: string }>
): InputSelectValue[] {
  return items.map(({ name, id }) => ({
    label: name,
    value: id
  }))
}
