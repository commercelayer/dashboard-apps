import { useSyncFormPackingWeight } from '#hooks/useSyncFormPackingWeight'
import {
  Grid,
  HookedInput,
  HookedInputSelect
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'
import { useFormContext } from 'react-hook-form'

export function FormPackingFieldWeight({
  shipment
}: {
  shipment: Shipment
}): JSX.Element {
  const { watch } = useFormContext()
  useSyncFormPackingWeight({ shipment })

  return (
    <Grid columns='2'>
      <HookedInput label='Weight' name='weight' />
      <HookedInputSelect
        name='unitOfWeight'
        label='Unit of weight'
        key={watch('unitOfWeight')}
        initialValues={[
          {
            value: 'gr',
            label: 'grams'
          },
          {
            value: 'lb',
            label: 'pounds'
          },
          {
            value: 'oz',
            label: 'ounces'
          }
        ]}
      />
    </Grid>
  )
}
