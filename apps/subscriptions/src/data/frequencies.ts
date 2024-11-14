import cronstrue from 'cronstrue'
import 'cronstrue/locales/en'

interface SelectableFrequency {
  label: string
  value: string
}

/**
 * Provides a list of translated frequencies suitable for filters options.
 */
export const frequenciesTranslations: SelectableFrequency[] = [
  {
    value: 'hourly',
    label: 'Hourly'
  },
  {
    value: 'daily',
    label: 'Daily'
  },
  {
    value: 'weekly',
    label: 'Weekly'
  },
  {
    value: 'monthly',
    label: 'Monthly'
  },
  {
    value: 'two-month',
    label: 'Every two months'
  },
  {
    value: 'two-months',
    label: 'Every two months'
  },
  {
    value: 'three-month',
    label: 'Every three months'
  },
  {
    value: 'three-months',
    label: 'Every three months'
  },
  {
    value: 'four-month',
    label: 'Every four months'
  },
  {
    value: 'four-months',
    label: 'Every four months'
  },
  {
    value: 'six-month',
    label: 'Every six months'
  },
  {
    value: 'six-months',
    label: 'Every six months'
  },
  {
    value: 'yearly',
    label: 'Yearly'
  }
]

/**
 * Generate a unique list of selectable frequencies suitable for filters options.
 */
export const frequenciesForFilters = (): SelectableFrequency[] => {
  const frequencies = frequenciesTranslations.reduce(
    (acc: SelectableFrequency[], obj: SelectableFrequency) => {
      if (!acc.some((item) => item.label === obj.label)) {
        acc.push(obj)
      }
      return acc
    },
    []
  )
  return frequencies
}

export const getFrequencyByValue = (
  frequencyValue: string
): SelectableFrequency => {
  return (
    frequenciesTranslations.find((f) => f.value === frequencyValue) ?? {
      label: frequencyValue,
      value: frequencyValue
    }
  )
}

/**
 * Extract, if available, a frequency label of a given value.
 * @param value - A given value to search for a label.
 * @returns a string containing either the calculated label or the value itself if the label is not found.
 */
export const getFrequencyLabelByValue = (value: string): string =>
  frequenciesTranslations.find((f) => f.value === value)?.label ??
  cronstrue.toString(value)
