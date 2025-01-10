import { useSyncFormPackingWeight } from '#hooks/useSyncFormPackingWeight'
import {
  Grid,
  HookedInput,
  HookedInputSelect,
  useTranslation
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'
import { useFormContext } from 'react-hook-form'

export function FormPackingFieldWeight({
  shipment
}: {
  shipment: Shipment
}): JSX.Element {
  const { watch } = useFormContext()
  const { t } = useTranslation()
  useSyncFormPackingWeight({ shipment })

  return (
    <Grid columns='2'>
      <HookedInput label={t('apps.shipments.details.weight')} name='weight' />
      <HookedInputSelect
        name='unitOfWeight'
        label={t('apps.shipments.form.unit_of_weight')}
        key={watch('unitOfWeight')}
        initialValues={[
          {
            value: 'gr',
            label: t(
              'resources.parcels.attributes.unit_of_weight.gr'
            ).toLowerCase()
          },
          {
            value: 'lb',
            label: t(
              'resources.parcels.attributes.unit_of_weight.lb'
            ).toLowerCase()
          },
          {
            value: 'oz',
            label: t(
              'resources.parcels.attributes.unit_of_weight.oz'
            ).toLowerCase()
          }
        ]}
      />
    </Grid>
  )
}
