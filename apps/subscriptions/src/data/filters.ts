import type { FiltersInstructions } from '@commercelayer/app-elements'

export const instructions: FiltersInstructions = [
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
      predicate: 'frequency_in'
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
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
            label: '2-Month'
          },
          {
            value: 'three-month',
            label: '3-Month'
          },
          {
            value: 'four-month',
            label: '4-Month'
          },
          {
            value: 'six-month',
            label: '6-Month'
          },
          {
            value: 'yearly',
            label: 'Yearly'
          }
        ]
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
