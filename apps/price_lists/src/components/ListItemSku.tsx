import {
  Avatar,
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate,
  type ListItemProps
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { makeSku } from 'src/mocks/resources/skus'

interface Props {
  resource?: Sku
  variant: ListItemProps['variant']
  disabled?: ListItemProps['disabled']
  onSelect?: (resource: Sku) => void
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku(), variant, disabled = false, onSelect }) => {
    return (
      <ListItem
        onClick={
          !disabled
            ? (e: any) => {
                e.preventDefault()
                if (onSelect != null) {
                  onSelect(resource)
                }
              }
            : undefined
        }
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
        variant={variant}
        disabled={disabled}
      >
        <div>
          <Text tag='div' variant='info' weight='semibold'>
            {resource.code}
          </Text>
          <Text tag='div' weight='bold'>
            {resource.name}
          </Text>
        </div>
        {variant === 'boxed' && !disabled && (
          <Icon
            name='pencilSimple'
            size='18'
            weight='bold'
            className='text-primary'
          />
        )}
      </ListItem>
    )
  }
)
