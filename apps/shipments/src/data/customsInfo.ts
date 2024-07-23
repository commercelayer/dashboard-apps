/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type InputSelectValue } from '@commercelayer/app-elements'

type AcceptedValues<T> = [T, ...T[]]

/**
 * For details about the following values and types, see:
 * @see https://www.easypost.com/customs-guide
 */

type IncotermsRule =
  | 'EXW'
  | 'FCA'
  | 'CPT'
  | 'CIP'
  | 'DAT'
  | 'DAP'
  | 'DDP'
  | 'FAS'
  | 'FOB'
  | 'CFR'
  | 'CIF'

type DeliveryConfirmation = 'SIGNATURE' | 'NO_SIGNATURE'

type ContentType =
  | 'merchandise'
  | 'gift'
  | 'documents'
  | 'returned_goods'
  | 'sample'
  | 'other'

type NonDeliveryOptions = 'return' | 'abandon'

type RestrictionType =
  | 'none'
  | 'other'
  | 'quarantine'
  | 'sanitary_phytosanitary_inspection'

function dictionaryToSelectOption(
  dictionary: Record<string, string>
): InputSelectValue[] {
  return Object.entries(dictionary).map(([value, label]) => ({ value, label }))
}

export function getIncotermsRule() {
  const dictionary: Record<IncotermsRule, string> = {
    EXW: 'EXW (Ex Works)',
    FCA: 'FCA (Free Carrier)',
    CPT: 'CPT (Carriage Paid To)',
    CIP: 'CIP (Carriage and Insurance Paid To)',
    DAT: 'DAT (Delivered At Terminal)',
    DAP: 'DAP (Delivered At Place)',
    DDP: 'DDP (Delivered Duty Paid)',
    FAS: 'FAS (Free Alongside Ship)',
    FOB: 'FOB (Free On Board)',
    CFR: 'CFR (Cost and Freight)',
    CIF: 'CIF (Cost, Insurance and Freight)'
  }
  const acceptedValues = Object.keys(
    dictionary
  ) as AcceptedValues<IncotermsRule>

  return {
    acceptedValues,
    selectOptions: dictionaryToSelectOption(dictionary).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
    getLabel: (value: IncotermsRule) => dictionary[value] ?? value
  }
}

export function getDeliveryConfirmation() {
  const dictionary: Record<DeliveryConfirmation, string> = {
    SIGNATURE: 'Signature',
    NO_SIGNATURE: 'No signature'
  }
  const acceptedValues = Object.keys(
    dictionary
  ) as AcceptedValues<DeliveryConfirmation>
  return {
    acceptedValues,
    selectOptions: dictionaryToSelectOption(dictionary),
    getLabel: (value: DeliveryConfirmation) => dictionary[value] ?? value
  }
}

export function getContentType() {
  const dictionary: Record<ContentType, string> = {
    merchandise: 'Merchandise',
    gift: 'Gift',
    documents: 'Documents',
    returned_goods: 'Returned goods',
    sample: 'Sample',
    other: 'Other'
  }
  const acceptedValues = Object.keys(dictionary) as AcceptedValues<ContentType>
  return {
    acceptedValues,
    selectOptions: dictionaryToSelectOption(dictionary),
    getLabel: (value: ContentType) => dictionary[value] ?? value
  }
}

export function getNonDeliveryOption() {
  const dictionary: Record<NonDeliveryOptions, string> = {
    return: 'Return',
    abandon: 'Abandon'
  }
  const acceptedValues = Object.keys(
    dictionary
  ) as AcceptedValues<NonDeliveryOptions>

  return {
    acceptedValues,
    selectOptions: dictionaryToSelectOption(dictionary),
    getLabel: (value: NonDeliveryOptions) => dictionary[value] ?? value
  }
}

export function getRestrictionType() {
  const dictionary: Record<RestrictionType, string> = {
    none: 'None',
    other: 'Other',
    quarantine: 'Quarantine',
    sanitary_phytosanitary_inspection: 'Sanitary or Phytosanitary inspection'
  }
  const acceptedValues = Object.keys(
    dictionary
  ) as AcceptedValues<RestrictionType>

  return {
    acceptedValues,
    selectOptions: dictionaryToSelectOption(dictionary),
    getLabel: (value: RestrictionType) => dictionary[value] ?? value
  }
}
