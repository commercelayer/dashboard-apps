import {
  Avatar,
  HookedInputCheckboxGroup,
  ListItem,
  Text,
  type HookedInputCheckboxGroupProps
} from '@commercelayer/app-elements'

import type { LineItem } from '@commercelayer/sdk'
import { useMemo } from 'react'
interface Props {
  lineItems: LineItem[]
}

export function FormFieldItems({ lineItems }: Props): JSX.Element {
  const options: HookedInputCheckboxGroupProps['options'] = useMemo(
    () =>
      lineItems.map((item) => ({
        value: item.id,
        content: (
          <ListItem
            alignIcon='center'
            alignItems='center'
            borderStyle='none'
            icon={
              item.image_url != null ? (
                <Avatar
                  alt={item.name ?? ''}
                  size='small'
                  src={item.image_url as `https://${string}`}
                />
              ) : undefined
            }
            padding='none'
          >
            <div>
              <Text size='regular' tag='div' weight='bold'>
                {item.name}
              </Text>
            </div>
          </ListItem>
        ),
        quantity: {
          min: 1,
          max: item.quantity
        }
      })),
    [lineItems]
  )

  if (options.length === 0) {
    return <div>No items</div>
  }

  return (
    <>
      <HookedInputCheckboxGroup name='items' title='Items' options={options} />
    </>
  )
}
