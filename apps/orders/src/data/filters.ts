import { t, type FiltersInstructions } from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'

export const makeInstructions = ({
  sortByAttribute = 'placed_at'
}: {
  sortByAttribute?: 'placed_at' | 'created_at'
}): FiltersInstructions => [
  {
    label: t('resources.markets.name_other'),
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
    label: t('apps.orders.attributes.status'),
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: ['placed', 'approved', 'cancelled', 'editing']
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'pending', label: 'Pending', isHidden: true },
          { value: 'placed', label: 'Placed' },
          { value: 'approved', label: 'Approved' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'editing', label: 'Editing' }
        ]
      }
    }
  },
  {
    label: t('apps.orders.attributes.payment_status'),
    type: 'options',
    sdk: {
      predicate: 'payment_status_in'
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'authorized', label: 'Authorized' },
          { value: 'paid', label: 'Paid' },
          { value: 'voided', label: 'Voided' },
          { value: 'refunded', label: 'Refunded' },
          { value: 'partially_authorized', label: 'Partially authorized' },
          { value: 'partially_refunded', label: 'Partially refunded' },
          { value: 'free', label: 'Free' },
          { value: 'unpaid', label: 'Unpaid' }
        ]
      }
    }
  },
  {
    label: t('apps.orders.attributes.fulfillment_status'),
    type: 'options',
    sdk: {
      predicate: 'fulfillment_status_in'
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'unfulfilled', label: 'Unfulfilled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'fulfilled', label: 'Fulfilled' },
          { value: 'not_required', label: 'Not Required' }
        ]
      }
    }
  },
  {
    label: t('apps.orders.task.archived'),
    type: 'options',
    sdk: {
      predicate: 'archived',
      parseFormValue: (value) =>
        value === 'show' ? undefined : value === 'only'
    },
    hidden: true,
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'single',
        options: [
          { value: 'only', label: 'Only archived' },
          { value: 'hide', label: 'Hide archived' },
          { value: 'show', label: 'Show all, both archived and not' }
        ]
      }
    }
  },
  {
    label: t('common.time_range'),
    type: 'timeRange',
    sdk: {
      predicate: sortByAttribute
    },
    render: {
      component: 'dateRangePicker'
    }
  },
  {
    label: t('common.amount'),
    type: 'currencyRange',
    sdk: {
      predicate: 'total_amount_cents'
    },
    render: {
      component: 'inputCurrencyRange',
      props: {
        label: 'Amount'
      }
    }
  },
  {
    label: t('resources.tags.name_other'),
    type: 'options',
    sdk: {
      predicate: 'tags_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'tags',
        searchBy: 'name_cont',
        sortBy: { attribute: 'name', direction: 'asc' },
        previewLimit: 5,
        showCheckboxIcon: false
      }
    }
  },

  {
    label: t('common.search'),
    type: 'textSearch',
    sdk: {
      predicate: 'aggregated_details',
      parseFormValue: parseTextSearchValue
    },
    render: {
      component: 'searchBar'
    }
  }
]

export const makeCartsInstructions = (): FiltersInstructions => [
  {
    label: t('apps.orders.attributes.status'),
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: ['pending']
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [{ value: 'pending', label: 'Pending', isHidden: true }]
      }
    },
    hidden: true
  },
  {
    label: t('apps.orders.attributes.payment_status'),
    type: 'options',
    sdk: {
      predicate: 'payment_status_in'
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'authorized', label: 'Authorized' },
          { value: 'paid', label: 'Paid' },
          { value: 'voided', label: 'Voided' },
          { value: 'refunded', label: 'Refunded' },
          { value: 'partially_authorized', label: 'Partially authorized' },
          { value: 'partially_refunded', label: 'Partially refunded' },
          { value: 'free', label: 'Free' },
          { value: 'unpaid', label: 'Unpaid' }
        ]
      }
    }
  },
  {
    label: t('common.amount'),
    type: 'currencyRange',
    sdk: {
      predicate: 'total_amount_cents'
    },
    render: {
      component: 'inputCurrencyRange',
      props: {
        label: 'Amount'
      }
    }
  },
  {
    label: t('common.search'),
    type: 'textSearch',
    sdk: {
      predicate: 'aggregated_details',
      parseFormValue: parseTextSearchValue
    },
    render: {
      component: 'searchBar'
    }
  }
]

export function parseTextSearchValue(value: unknown): string | undefined {
  if (typeof value !== 'string' || value == null || isEmpty(value.trim())) {
    return undefined
  }
  const searchText = value.trim()

  if (searchText.includes('*') || searchText.includes('"')) {
    return searchText
  }

  // It's not a full or partial email, but text contains a dot, needs to wrap it in double quotes so API won't escape the dot
  if (searchText.includes('.') && !searchText.includes('@')) {
    return `*"${searchText}"*`
  }

  // Could be a partial email, needs to wrap it in double quotes so API won't escape the dot but final @ needs to be removed
  if (searchText.includes('.') && searchText.at(-1) === '@') {
    return `*"${searchText.replace('@', '')}"*`
  }

  return `*${wrapEmailInQuotes(searchText)}*`
}

// If an email is found in a sentence, wrap it in double quotes
function wrapEmailInQuotes(sentence: string): string {
  const sentenceHasWordsWithMultipleAtSymbols = sentence
    .split(' ')
    .some((word) => (word.match(/@/g) ?? []).length > 1)

  if (sentenceHasWordsWithMultipleAtSymbols) {
    return sentence
  }

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  return sentence.replace(emailRegex, '"$1"')
}
