import type { PriceTierType } from '#types'

import type { PriceTierFormValues } from '#components/PriceTierForm'
import type { PriceTier } from '@commercelayer/sdk'
import { getFrequenciesForSelect } from './frequencies'

type UpTo = PriceTier['up_to']

/**
 * Returns the API resource type of a given price tier type.
 * @param type given type of kind `volume` or `frequency`
 * @returns a valid price tier type
 */
export const getPriceTierSdkResource = (
  type: PriceTierType
): 'price_frequency_tiers' | 'price_volume_tiers' => {
  return type === 'frequency' ? 'price_frequency_tiers' : 'price_volume_tiers'
}

/**
 * Calculate an `up_to` value to create or update price tiers resources.
 * @param formValues a given `formValues` object read from price tiers form
 * @returns a valid price tiers `up_to` attribute value
 */
export const getUpToFromForm = (formValues: PriceTierFormValues): UpTo => {
  if (formValues.type === 'volume') {
    return !isNaN(parseInt(formValues.up_to))
      ? parseInt(formValues.up_to)
      : null
  }
  const frequency = formValues.up_to
  if (frequency === 'unlimited') {
    return null
  } else if (frequency === 'custom') {
    return parseInt(formValues.up_to_days ?? '')
  } else {
    return parseInt(formValues.up_to)
  }
}

/**
 * Verifies if the value of a given `up_to` attribute is one of the known `frequencies` selectable in price tier form.
 * @param upTo a given `up_to` attribute value of price tiers resources
 * @returns a `boolean` value
 */
export const isUpToForFrequencyFormCustom = (upTo: UpTo): boolean => {
  const frequenciesForSelect = getFrequenciesForSelect()
  const upToString = getUpToForVolumeForm(upTo)
  return (
    upTo != null &&
    frequenciesForSelect.find((freq) => freq.value === upToString) == null
  )
}

/**
 * Calculates an `up_to` attribute value suitable for `frequency` type price tiers form.
 * @param upTo a given `up_to` attribute value of price tiers resources
 * @returns the `up_to` value in string
 */
export const getUpToForFrequencyForm = (upTo: UpTo): string => {
  const frequenciesForSelect = getFrequenciesForSelect()
  const upToString = getUpToForVolumeForm(upTo)
  const upToInFrequencies = frequenciesForSelect.find(
    (freq) => freq.value === upToString
  )
  if (upTo == null) {
    return 'unlimited'
  } else if (upToInFrequencies != null) {
    return upToInFrequencies.value
  } else {
    return upToString
  }
}

/**
 * Calculates an `up_to` attribute value suitable for `volume` type price tiers form.
 * @param upTo a given `up_to` attribute value of price tiers resources
 * @returns the `up_to` value in string
 */
export const getUpToForVolumeForm = (upTo: UpTo): string => {
  return (
    !isNaN(parseInt(upTo?.toString() ?? ''))
      ? parseInt(upTo?.toString() ?? '')
      : ''
  ).toString()
}

/**
 * Calculates an `up_to` attribute value suitable for price tiers form based on a given price tier type.
 * @param upTo a given `up_to` attribute value of `price_tiers` resources
 * @returns the `up_to` value in string
 */
export const getUpToForForm = (upTo: UpTo, type: PriceTierType): string => {
  if (type === 'frequency') {
    return getUpToForFrequencyForm(upTo)
  } else {
    return getUpToForVolumeForm(upTo)
  }
}

/**
 * Calculates an `up_to` attribute value suitable for `frequency` type price tiers table rows.
 * @param upTo a given `up_to` attribute value of `price_tiers` resources
 * @returns the `up_to` value in string
 */
export const getUpToForFrequencyTable = (upTo: UpTo): string => {
  const upToAsNumber = parseInt(upTo?.toString() ?? '')
  const frequenciesForSelect = getFrequenciesForSelect()
  const knownFrequency = frequenciesForSelect.find(
    (freq) => parseInt(freq.value) === upToAsNumber
  )
  if (upTo == null) {
    return `♾️`
  } else if (knownFrequency != null) {
    return knownFrequency.label
  } else {
    return `${upToAsNumber} days`
  }
}

/**
 * Calculates an `up_to` attribute value suitable for `volume` type price tiers table rows.
 * @param upTo a given `up_to` attribute value of `price_tiers` resources
 * @returns the `up_to` value in string
 */
export const getUpToForVolumeTable = (upTo: UpTo): string => {
  return upTo == null ? `♾️` : getUpToForVolumeForm(upTo)
}

/**
 * Calculates an `up_to` attribute value suitable for price tiers table rows based on a given price tier type.
 * @param upTo a given `up_to` attribute value of `price_tiers` resources
 * @returns the `up_to` value in string
 */
export const getUpToForTable = (upTo: UpTo, type: PriceTierType): string => {
  if (type === 'frequency') {
    return getUpToForFrequencyTable(upTo)
  } else {
    return getUpToForVolumeTable(upTo)
  }
}
