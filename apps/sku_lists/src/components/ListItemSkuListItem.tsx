import { makeSkuListItem } from '#mocks'
import {
  Avatar,
  Icon,
  InputSpinner,
  ListItem,
  Text,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'
import debounce from 'lodash/debounce'

interface Props extends ResourceListItemTemplateProps<'sku_list_items'> {
  hasBundles: boolean
}

export const ListItemSkuListItem = withSkeletonTemplate<Props>(
  ({
    resource = makeSkuListItem(),
    remove,
    hasBundles,
    isLoading
  }): JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()
    const { canUser } = useTokenProvider()

    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.sku?.name ?? ''}
            src={resource.sku?.image_url as `https://${string}`}
          />
        }
        alignItems='center'
        className='bg-white'
        padding='y'
      >
        <div>
          <Text tag='div' weight='medium' variant='info' size='small'>
            {resource.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.sku?.name}
          </Text>
        </div>
        {isLoading !== true && (
          <div className='flex items-center gap-4'>
            {canUser('update', 'sku_list_items') && !hasBundles ? (
              <InputSpinner
                defaultValue={resource?.quantity ?? 1}
                min={1}
                onChange={debounce((newQuantity) => {
                  if (resource != null) {
                    void sdkClient.sku_list_items.update({
                      id: resource.id,
                      quantity: newQuantity
                    })
                  }
                }, 500)}
              />
            ) : (
              <Text weight='semibold' wrap='nowrap'>
                x {resource.quantity}
              </Text>
            )}
            {canUser('destroy', 'sku_list_items') && !hasBundles && (
              <button
                className='rounded'
                type='button'
                onClick={() => {
                  if (resource != null) {
                    void sdkClient.sku_list_items
                      .delete(resource.id)
                      .then(() => {
                        remove?.()
                      })
                  }
                }}
              >
                <Icon name='trash' size='18' className='text-primary' />
              </button>
            )}
          </div>
        )}
      </ListItem>
    )
  }
)
