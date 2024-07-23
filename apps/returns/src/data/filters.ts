import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export const instructions: FiltersInstructions = [
  {
    label: 'Return locations',
    type: 'options',
    sdk: {
      predicate: 'stock_location_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'stock_locations',
        searchBy: 'name_cont',
        sortBy: { attribute: 'id', direction: 'asc' },
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
      predicate: 'status_in',
      defaultOptions: [
        'requested',
        'approved',
        'shipped',
        'received',
        'cancelled',
        'rejected'
      ]
    },

    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'requested', label: 'Requested' },
          { value: 'approved', label: 'Approved' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'received', label: 'Received' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'rejected', label: 'Rejected' }
        ]
      }
    }
  },
  {
    label: 'Time Range',
    type: 'timeRange',
    sdk: {
      predicate: 'updated_at'
    },
    render: {
      component: 'dateRangePicker'
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate:
        [
          'number',
          'reference',
          'customer_email',
          'origin_address_email',
          'origin_address_company',
          'origin_address_first_name',
          'origin_address_last_name',
          'origin_address_billing_info',
          'destination_address_email',
          'destination_address_company',
          'destination_address_first_name',
          'destination_address_last_name',
          'destination_address_billing_info'
        ].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
