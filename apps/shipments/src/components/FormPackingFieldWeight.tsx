import { useSyncFormPackingWeight } from '#hooks/useSyncFormPackingWeight'
import {
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
}): React.JSX.Element {
  const { watch } = useFormContext()
  const { t } = useTranslation()
  useSyncFormPackingWeight({ shipment })

  return (
    <div
      style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2.5fr 1fr' }}
    >
      <HookedInput label={t('apps.shipments.details.weight')} name='weight' />
      <HookedInputSelect
        name='unitOfWeight'
        label={`\u00A0`} // empty white space to keep field alignment
        aria-label={t('apps.shipments.form.unit_of_weight')}
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
    </div>
  )
}
