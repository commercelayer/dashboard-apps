import type { FiltersInstructions } from '@commercelayer/app-elements'
import { frequenciesForFilters, getFrequencyLabelByValue } from './frequencies'

export const instructions = (
  subscriptionModelFrequencies?: string[]
): FiltersInstructions => {
  const frequenciesByModel = subscriptionModelFrequencies?.map((f) => {
    return {
      value: f,
      label: getFrequencyLabelByValue(f)
    }
  })
  const frequencies = frequenciesForFilters()

  return [
    {
      label: 'Markets',
      type: 'options',
      sdk: {
        predicate: 'market_id_in'
      },
      render: {
        component: 'inputResourceGroup',
        props: {
          fieldForLabel: 'name',
          fieldForValue: 'id',
          resource: 'markets',
          searchBy: 'name_cont',
          sortBy: { attribute: 'name', direction: 'asc' },
          previewLimit: 5,
          filters: {
            disabled_at_null: true
          }
        }
      }
    },
    {
      label: 'Status',
      type: 'options',
      sdk: {
        predicate: 'status_in'
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'multi',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        }
      }
    },
    {
      label: 'Frequency',
      type: 'options',
      sdk: {
        predicate: 'frequency_matches'
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'single',
          options: frequenciesByModel ?? frequencies
        }
      }
    },

    {
      label: 'Search',
      type: 'textSearch',
      sdk: {
        predicate: ['number', 'customer_email'].join('_or_') + '_cont'
      },
      render: {
        component: 'searchBar'
      }
    }
  ]
}
