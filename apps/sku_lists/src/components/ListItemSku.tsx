import {
  Avatar,
  Grid,
  InputCheckbox,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { makeSku } from 'src/mocks/resources/skus'

interface Props {
  resource?: Sku
  onSelect?: (resource: Sku) => void
  isSelected?: boolean
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku(), onSelect, isSelected }) => {
    return (
      <ListItem
        onClick={(e) => {
          e.preventDefault()
          onSelect?.(resource)
        }}
        icon={
          <Grid columns='auto' alignItems='center'>
            <InputCheckbox
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onSelect?.(resource)
              }}
            />
            <Avatar
              alt={resource.name}
              src={resource.image_url as `https://${string}`}
            />
          </Grid>
        }
      >
        <div>
          <Text tag='div' variant='info' weight='semibold' size='small'>
            {resource.code}
          </Text>
          <Text tag='div' weight='bold'>
            {resource.name}
          </Text>
        </div>
      </ListItem>
    )
  }
)
