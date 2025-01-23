import {
  getContentType,
  getDeliveryConfirmation,
  getIncotermsRule,
  getNonDeliveryOption,
  getRestrictionType
} from '#data/customsInfo'
import type { PackingFormValues } from '#data/packingFormSchema'
import {
  Card,
  HookedInput,
  HookedInputCheckbox,
  HookedInputSelect,
  Legend,
  Spacer,
  Text,
  useTranslation
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { useEffect, type FC, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'

/**
 * This component renders the "More options" section of the packing form.
 * It contains a optional fields that are not required to create a parcel, but add more information for the carrier.
 * - IncotermsRules
 * - DeliveryConfirmation
 * - CustomsInfo
 */
export function FormPackingMoreOptions({
  shipment
}: {
  shipment: Shipment
}): JSX.Element {
  const { t } = useTranslation()
  const showCustomsInfo =
    shipment?.shipping_address?.country_code !==
    shipment?.origin_address?.country_code
  return (
    <>
      <Spacer bottom='4'>
        <Legend>{t('apps.shipments.form.more_options')}</Legend>
      </Spacer>

      <IncotermsRules />
      <DeliveryConfirmation />
      {showCustomsInfo && <CustomsInfo />}
    </>
  )
}

const IncotermsRules: FC = () => {
  const { t } = useTranslation()
  return (
    <OptionsGroup
      label={t('apps.shipments.form.incoterms_rules')}
      fieldsToReset={['incoterm']}
      name='incotermOptionsGroup'
    >
      <HookedInputSelect
        name='incoterm'
        initialValues={getIncotermsRule().selectOptions}
        placeholder={t('apps.shipments.form.select_option')}
        isClearable
      />
    </OptionsGroup>
  )
}

const DeliveryConfirmation: FC = () => {
  const { t } = useTranslation()

  return (
    <OptionsGroup
      label={t('apps.shipments.form.delivery_confirmation')}
      fieldsToReset={['delivery_confirmation']}
      name='deliveryOptionsGroup'
    >
      <HookedInputSelect
        name='delivery_confirmation'
        initialValues={getDeliveryConfirmation().selectOptions}
        placeholder={t('apps.shipments.form.select_option')}
        isClearable
      />
    </OptionsGroup>
  )
}

/**
 * This component holds the fields related to the customs info that required for cross-borders shipments
 * They need to be added to the parcel because they will be required when getting rates from easypost.
 *
 * Some fields are linked to the value of other fields, so they are reset when the value of the linked field changes,
 * such as `contents_explanation` and `restriction_comments` when `contents_type` and `restriction_type` are changed.
 */
const CustomsInfo: FC = () => {
  const { watch, setValue } = useFormContext<PackingFormValues>()
  const { t } = useTranslation()

  const contentTypeValue = watch('contents_type')
  const restrictionTypeValue = watch('restriction_type')

  useEffect(
    function emptyOtherExplanation() {
      if (contentTypeValue !== 'other') {
        setValue('contents_explanation', undefined)
      }
      if (restrictionTypeValue !== 'other') {
        setValue('restriction_comments', undefined)
      }
    },
    [contentTypeValue, restrictionTypeValue]
  )

  return (
    <OptionsGroup
      label={t('apps.shipments.form.require_custom_forms')}
      name='customs_info_required'
      fieldsToReset={[
        'eel_pfc',
        'contents_type',
        'contents_explanation',
        'non_delivery_option',
        'restriction_type',
        'restriction_comments',
        'customs_signer'
      ]}
    >
      <Card overflow='visible' backgroundColor='light'>
        <Spacer bottom='4'>
          <HookedInput name='eel_pfc' label='EEL/PFC' />
        </Spacer>

        <Spacer bottom='4'>
          <HookedInputSelect
            name='contents_type'
            label={t('apps.shipments.form.customs_info_type')}
            initialValues={getContentType().selectOptions}
            isClearable
          />
        </Spacer>

        {contentTypeValue === 'other' && (
          <Spacer bottom='4'>
            <HookedInput
              name='contents_explanation'
              placeholder={t('apps.shipments.form.content_explanation_hint')}
            />
          </Spacer>
        )}

        <Spacer bottom='4'>
          <HookedInputSelect
            name='non_delivery_option'
            label={t('apps.shipments.form.customs_info_failed_delivery_label')}
            initialValues={getNonDeliveryOption().selectOptions}
            isClearable
          />
        </Spacer>

        <Spacer bottom='4'>
          <HookedInputSelect
            name='restriction_type'
            label={t('apps.shipments.form.customs_info_restriction_type_label')}
            initialValues={getRestrictionType().selectOptions}
            isClearable
          />
        </Spacer>
        {!isEmpty(restrictionTypeValue) && restrictionTypeValue !== 'none' && (
          <Spacer bottom='4'>
            <HookedInput
              name='restriction_comments'
              placeholder={t('apps.shipments.form.content_explanation_hint')}
            />
          </Spacer>
        )}

        <Spacer bottom='4'>
          <HookedInput
            name='customs_signer'
            label={t('apps.shipments.form.customs_info_customs_signer_label')}
          />
        </Spacer>

        <HookedInputCheckbox name='customs_certify'>
          <Text weight='semibold'>
            {t('apps.shipments.form.customs_info_confirm_checkbox_label')}
          </Text>
        </HookedInputCheckbox>
      </Card>
    </OptionsGroup>
  )
}

/**
 * Group set of fields (children) within a checkbox. Children will be only visible when element is checked.
 * When the checkbox is unchecked, the children are unmounted and the fields specified in `fieldsToReset` are emptied.
 */
const OptionsGroup: FC<{
  /** label for the group */
  label: string
  /** field name to control */
  name: string
  /** reset fields specified in the array when group is closed/unchecked */
  fieldsToReset: string[]
  /** children to render when open/checked */
  children: ReactNode
}> = ({ label, fieldsToReset, name, children }) => {
  const { setValue, formState, watch } = useFormContext()
  const isActive = Boolean(watch(name))

  useEffect(
    function openWhenChildInputHasError() {
      const hasErrorInside = fieldsToReset.some((field) => {
        return formState.errors[field]
      })
      if (hasErrorInside) {
        setValue(name, true)
      }
    },
    [formState.errors]
  )

  useEffect(
    function resetFieldsWhenClosed() {
      if (!isActive) {
        fieldsToReset.forEach((field) => {
          setValue(field, undefined)
        })
      }
    },
    [isActive]
  )

  return (
    <Spacer bottom='2'>
      <fieldset>
        <HookedInputCheckbox name={name}>
          <Text weight='semibold'>{label}</Text>
        </HookedInputCheckbox>

        {isActive && (
          <Spacer top='4' left='8' bottom='2'>
            {children}
          </Spacer>
        )}
      </fieldset>
    </Spacer>
  )
}
