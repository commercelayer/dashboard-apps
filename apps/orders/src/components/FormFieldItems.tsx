import {
  Avatar,
  HookedInputCheckboxGroup,
  Input,
  ListItem,
  Text,
  useTranslation,
  type HookedInputCheckboxGroupProps
} from '@commercelayer/app-elements'

import type { ReturnFormValues } from '#components/FormReturn'
import type { LineItem } from '@commercelayer/sdk'
import { isEmpty } from 'lodash-es'
import { useEffect, useState, type FC } from 'react'
import { useFormContext } from 'react-hook-form'

interface Props {
  lineItems: LineItem[]
}

export function FormFieldItems({ lineItems }: Props): React.JSX.Element {
  const { t } = useTranslation()

  if (lineItems.length === 0) {
    return <div>{t('common.no_items')}</div>
  }

  return (
    <HookedInputCheckboxGroup
      name='items'
      title='Items'
      options={lineItems.map(makeOptionItem)}
    />
  )
}

function makeOptionItem(
  item: LineItem
): HookedInputCheckboxGroupProps['options'][number] {
  return {
    value: item.id,
    content: (
      <>
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
      </>
    ),
    checkedElement: <OptionInputReason item={item} />,
    quantity: {
      min: 1,
      max: item.quantity
    }
  }
}

/** When checked, show input for reason */
const OptionInputReason: FC<{ item: LineItem }> = ({ item }) => {
  const { watch, setValue } = useFormContext<ReturnFormValues>()
  const items = watch('items') ?? []
  const isSelected = items.find(({ value }) => value === item.id) != null
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isSelected && !isEmpty(reason)) {
      setReason('')
    }
  }, [isSelected, reason])

  return (
    <Input
      value={reason}
      placeholder='Add a reason (optional)'
      onChange={(e) => {
        setReason(e.target.value)
        setValue(
          `items.${items.findIndex(({ value }) => value === item.id)}.reason`,
          e.target.value
        )
      }}
    />
  )
}
