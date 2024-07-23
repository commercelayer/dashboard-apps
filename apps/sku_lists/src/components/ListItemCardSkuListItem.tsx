import {
  Avatar,
  Icon,
  InputSpinner,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { FormSkuListItem } from './SkuListForm'

interface Props {
  resource?: FormSkuListItem
  onQuantityChange?: (resource: FormSkuListItem, quantity: number) => void
  onRemoveClick?: (resource: FormSkuListItem) => void
  isLoading?: boolean
  delayMs?: number
}

export const ListItemCardSkuListItem = withSkeletonTemplate<Props>(
  ({ resource, onQuantityChange, onRemoveClick }): JSX.Element | null => {
    return (
      <ListItem
        icon={
          <Avatar
            alt={resource?.sku?.name ?? ''}
            src={resource?.sku?.image_url as `https://${string}`}
          />
        }
        alignItems='center'
        variant='boxed'
        className='bg-white'
      >
        <div>
          <Text tag='div' weight='medium' variant='info' size='small'>
            {resource?.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource?.sku?.name}
          </Text>
        </div>
        <div className='flex items-center gap-4'>
          <InputSpinner
            defaultValue={resource?.quantity ?? 1}
            min={1}
            disableKeyboard
            onChange={(newQuantity) => {
              if (onQuantityChange != null && resource != null) {
                onQuantityChange(resource, newQuantity)
              }
            }}
          />
          <button
            className='rounded'
            type='button'
            onClick={() => {
              if (onRemoveClick != null && resource != null) {
                onRemoveClick(resource)
              }
            }}
          >
            <Icon
              name='trash'
              size='18'
              weight='bold'
              className='text-primary'
            />
          </button>
        </div>
      </ListItem>
    )
  }
)
