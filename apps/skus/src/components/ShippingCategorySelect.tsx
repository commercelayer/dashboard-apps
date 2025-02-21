import { fetchShippingCategories } from '#utils/fetchShippingCategories'
import {
  HookedInputSelect,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { ShippingCategory } from '@commercelayer/sdk'

export function ShippingCategorySelect({
  options
}: {
  options: ShippingCategory[]
}): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedInputSelect
      label='Shipping category'
      name='shippingCategory'
      initialValues={options.map(({ id, name }) => ({
        value: id,
        label: name
      }))}
      isClearable
      pathToValue='value'
      loadAsyncValues={async (hint) => {
        const list = await fetchShippingCategories({ sdkClient, hint })
        return list.map(({ id, name }) => ({
          value: id,
          label: name
        }))
      }}
      hint={{
        text: (
          <Text variant='info'>
            Used to manage different{' '}
            <a
              href='https://docs.commercelayer.io/core/v/api-reference/shipping_methods'
              target='_blank'
              rel='noreferrer'
            >
              shipping methods
            </a>
            . Optional for 'Do not ship'.
          </Text>
        )
      }}
    />
  )
}
